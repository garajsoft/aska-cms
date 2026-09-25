import "server-only";
import Link from "next/link";
import { getPayload } from "payload";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import config from "@/payload.config";
import type { Widgets as WidgetsGlobal } from "@/payload-types";
import { RenderedHtml } from "@/components/RenderedHtml";
import { FormRenderer, type SerializedFormField } from "./FormRenderer";

type AreaName = NonNullable<NonNullable<WidgetsGlobal["areas"]>[number]["area"]>;
type WidgetItem = NonNullable<NonNullable<WidgetsGlobal["areas"]>[number]["items"]>[number];

/** Sidebar / footer widget areas, configured in the Widgets global. */
export async function Widgets({ area }: { area: AreaName }) {
  const p = await getPayload({ config });
  const global = (await p.findGlobal({ slug: "widgets", depth: 2 })) as WidgetsGlobal;
  const match = (global.areas ?? []).find((a) => a.area === area);
  if (!match?.items?.length) return null;
  return (
    <div className="flex flex-col gap-6">
      {match.items.map((item, i) => (
        <Widget key={item.id ?? i} item={item} />
      ))}
    </div>
  );
}

async function Widget({ item }: { item: WidgetItem }) {
  const p = await getPayload({ config });
  switch (item.blockType) {
    case "heading":
      return <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{item.text}</h3>;
    case "richText":
      return item.content ? (
        <div
          className="text-sm text-zinc-600 [&_a]:underline"
          dangerouslySetInnerHTML={{
            __html: convertLexicalToHTML({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: item.content as any,
            }),
          }}
        />
      ) : null;
    case "recentPosts": {
      const count = Math.max(1, item.count ?? 5);
      const r = await p.find({
        collection: "blog",
        where: { _status: { equals: "published" } },
        sort: "-publishedAt",
        limit: count,
        depth: 0,
      });
      const docs = r.docs as unknown as { slug: string; title?: string }[];
      if (docs.length === 0) return null;
      return (
        <ul className="flex flex-col gap-2 text-sm">
          {docs.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/blog/${doc.slug}`} className="hover:underline">
                {doc.title ?? doc.slug}
              </Link>
            </li>
          ))}
        </ul>
      );
    }
    case "categories": {
      const r = await p.find({ collection: "categories", sort: "name", limit: 100, depth: 0 });
      const docs = r.docs as unknown as { id: number; name: string; slug: string }[];
      if (docs.length === 0) return null;
      const withCounts = await Promise.all(
        docs.map(async (doc) => {
          const c = await p.count({
            collection: "blog",
            where: { and: [{ category: { equals: doc.id } }, { _status: { equals: "published" } }] },
          });
          return { ...doc, count: c.totalDocs };
        })
      );
      return (
        <ul className="flex flex-col gap-2 text-sm">
          {withCounts.map((doc) => (
            <li key={doc.id}>
              <Link href={`/blog?category=${doc.slug}`} className="hover:underline">
                {doc.name} ({doc.count})
              </Link>
            </li>
          ))}
        </ul>
      );
    }
    case "searchBox":
      return (
        <form action="/search" method="get" role="search">
          <input
            type="search"
            name="q"
            placeholder="Search…"
            aria-label="Search"
            className="w-full rounded border border-black/15 px-3 py-1.5 text-sm"
          />
        </form>
      );
    case "form": {
      const rel = item.form;
      const formId = typeof rel === "object" && rel !== null ? rel.id : rel;
      const form = (await p
        .findByID({ collection: "forms", id: formId, depth: 0 })
        .catch(() => null)) as
        | {
            id: number;
            title: string;
            submitButtonLabel?: string | null;
            fields?: SerializedFormField[] | null;
            confirmationMessage?: unknown;
          }
        | null;
      if (!form) return null;
      const confirmationHtml = form.confirmationMessage
        ? convertLexicalToHTML({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: form.confirmationMessage as any,
          })
        : "";
      return (
        <FormRenderer
          formId={form.id}
          title={form.title}
          fields={form.fields ?? []}
          submitLabel={form.submitButtonLabel || "Submit"}
          confirmationHtml={confirmationHtml}
        />
      );
    }
    case "html":
      return <RenderedHtml html={item.code} />;
    default:
      return null;
  }
}

export default Widgets;
