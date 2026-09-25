import "server-only";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@/payload.config";
import { getBrandingAssets } from "@/lib/settings/repo";
import type { Link as MenuLink, Page, Blog } from "@/payload-types";

async function fetchPrimaryMenu(): Promise<MenuLink[] | null> {
  const p = await getPayload({ config });
  const settings = await p.findGlobal({ slug: "settings", depth: 2 });
  const menu = (settings as { primaryMenu?: unknown }).primaryMenu;
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
 * DEFAULT_COMPONENT for the header slot. Renders Settings → Navigation →
 * Primary Menu (built in the Menus collection) as the main nav, with one
 * level of hover dropdowns from each item's children. Falls back to the
 * plain brand mark when no menu is assigned.
 */
export async function Header() {
  const [{ logoLight }, items] = await Promise.all([getBrandingAssets(), fetchPrimaryMenu()]);
  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-4">
      <Link href="/" className="font-semibold">
        {logoLight?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoLight.url} alt={logoLight.alt ?? "Logo"} className="h-8 w-auto" />
        ) : (
          "aska"
        )}
      </Link>
      {items && (
        <nav aria-label="Primary">
          <ul className="flex items-center gap-6">
            {items.map((item, i) => {
              const href = itemHref(item);
              const children = item.children ?? [];
              if (!href) return null;
              return (
                <li key={item.id ?? i} className="relative group">
                  <Link href={href} className="text-sm hover:underline">
                    {item.label}
                  </Link>
                  {children.length > 0 && (
                    <ul className="absolute left-0 top-full z-10 hidden min-w-40 flex-col gap-1 border border-black/10 bg-white p-2 shadow-md group-hover:flex">
                      {children.map((child, j) => {
                        const childHref = itemHref(child as MenuLink);
                        if (!childHref) return null;
                        return (
                          <li key={child.id ?? j}>
                            <Link
                              href={childHref}
                              className="block whitespace-nowrap px-2 py-1 text-sm hover:underline"
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

export default Header;
