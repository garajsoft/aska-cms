import "server-only";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@/payload.config";
import type { Link as MenuLink, Page, Blog } from "@/payload-types";
import { Widgets } from "./Widgets";

async function fetchFooterMenu(): Promise<MenuLink[] | null> {
  const p = await getPayload({ config });
  const settings = await p.findGlobal({ slug: "settings", depth: 2 });
  const menu = (settings as { footerMenu?: unknown }).footerMenu;
  if (!menu || typeof menu !== "object") return null;
  const items = (menu as { items?: MenuLink[] | null }).items;
  return Array.isArray(items) && items.length > 0 ? items : null;
}

function itemHref(item: MenuLink): string | null {
  if (item.linkType === "page" && item.page && typeof item.page === "object") {
    return `/${(item.page as Page).slug}`;
  }
  if (item.linkType === "post" && item.post && typeof item.post === "object") {
    return `/blog/${(item.post as Blog).slug}`;
  }
  if (item.linkType === "url" && item.url) return item.url;
  return null;
}

/**
 * DEFAULT_COMPONENT for the footer slot. Renders Settings → Navigation →
 * Footer Menu as a link row, with the Widgets global's footer_1/2/3 areas
 * below it as three columns.
 */
export async function Footer() {
  const items = await fetchFooterMenu();
  return (
    <footer className="border-t border-black/10 px-6 py-10 text-sm text-zinc-500">
      {items && (
        <nav aria-label="Footer" className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-2">
          {items.map((item, i) => {
            const href = itemHref(item);
            if (!href) return null;
            return (
              <Link key={item.id ?? i} href={href} className="hover:underline">
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
      <div className="mx-auto mt-8 grid max-w-5xl gap-10 md:grid-cols-4">
        <Widgets area="footer_1" />
        <Widgets area="footer_2" />
        <Widgets area="footer_3" />
      </div>
      <p className="mx-auto mt-8 max-w-5xl">
        © {new Date().getFullYear()} aska. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
