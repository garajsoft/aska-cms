import Link from "next/link";
import { listPages } from "@/lib/pages/repo";

export const dynamic = "force-dynamic";

export default async function Home() {
  const pages = await listPages();
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-8 font-sans">
      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-zinc-500">Aska CMS</span>
        <h1 className="text-3xl font-semibold tracking-tight">Pages</h1>
        <p className="text-sm text-zinc-600">
          Payload CMS + GrapesJS visual editor + Stripe-backed ecommerce.
        </p>
      </header>
      <ul className="flex flex-col divide-y divide-black/5 rounded-lg border border-black/10">
        {pages.length === 0 && (
          <li className="p-4 text-sm text-zinc-500">
            No pages yet. Create one in the admin or the editor.
          </li>
        )}
        {pages.map((page) => (
          <li key={page.id} className="flex items-center justify-between p-4">
            <Link href={`/${page.slug}`} className="font-medium hover:underline">
              {page.title} <span className="text-zinc-400">/{page.slug}</span>
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/${page.slug}`}
                className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/5"
              >
                View
              </Link>
              <Link
                href={`/editor?slug=${encodeURIComponent(page.slug)}`}
                className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white hover:bg-zinc-800"
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-3">
        <Link
          href="/editor?slug=home"
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Open editor
        </Link>
        <a href="/admin" className="rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5">
          Payload admin
        </a>
      </div>
    </div>
  );
}
