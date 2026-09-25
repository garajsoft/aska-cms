import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/account/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in" };

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { redirect: redirectTo } = await searchParams;
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Sign in</h1>
      <LoginForm redirectTo={redirectTo ?? "/account"} />
      <p className="mt-4 text-sm text-zinc-500">
        No account?{" "}
        <Link
          href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
          className="underline"
        >
          Create one
        </Link>
        .
      </p>
    </main>
  );
}
