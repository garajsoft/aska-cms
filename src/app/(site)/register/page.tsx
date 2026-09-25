import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/RegisterForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Create account</h1>
      <RegisterForm />
      <p className="mt-4 text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
        .
      </p>
    </main>
  );
}
