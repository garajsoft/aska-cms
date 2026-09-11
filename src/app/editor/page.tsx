import { redirect } from "next/navigation";
import { GrapesEditor } from "./GrapesEditor";
import { readPage } from "@/lib/pages/repo";
import { getCurrentUser } from "@/lib/auth/requireUser";

export const metadata = { title: "Editor — Aska CMS" };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ slug?: string }>;
}

export default async function EditorPage({ searchParams }: Props) {
  const { slug = "home" } = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    const back = `/editor?slug=${encodeURIComponent(slug)}`;
    redirect(`/admin/login?redirect=${encodeURIComponent(back)}`);
  }
  const initial = (await readPage(slug)) ?? {
    id: 0,
    title: slug,
    slug,
    html: "",
    css: "",
  };
  return <GrapesEditor slug={slug} initial={initial} />;
}
