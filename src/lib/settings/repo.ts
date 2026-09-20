import "server-only";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function getHomepageSlug(): Promise<string | null> {
  const p = await getPayload({ config });
  const s = await p.findGlobal({ slug: "settings", depth: 1 });
  const hp = (s as { homepage?: { slug?: string } | number | string | null }).homepage;
  if (!hp || typeof hp !== "object") return null;
  return hp.slug ?? null;
}
