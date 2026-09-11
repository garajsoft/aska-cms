import { readPage } from "@/lib/pages/repo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await readPage(slug);
  return { title: page?.title ?? "Not found" };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = await readPage(slug);
  if (!page) notFound();
  return (
    <>
      {page.css && <style dangerouslySetInnerHTML={{ __html: page.css }} />}
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
    </>
  );
}
