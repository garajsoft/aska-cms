import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/requireUser";
import { LogoutButton } from "@/components/account/LogoutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account");

  const { email, roles } = user as { email: string; roles?: string };
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Your account</h1>
      <dl className="mb-8 flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-black/10 pb-2">
          <dt className="text-zinc-500">Email</dt>
          <dd>{email}</dd>
        </div>
        {roles && (
          <div className="flex justify-between gap-4 border-b border-black/10 pb-2">
            <dt className="text-zinc-500">Role</dt>
            <dd>{roles}</dd>
          </div>
        )}
      </dl>
      <div className="flex items-center gap-4">
        <LogoutButton />
        <Link href="/" className="text-sm underline">
          Back to site
        </Link>
      </div>
    </main>
  );
}
