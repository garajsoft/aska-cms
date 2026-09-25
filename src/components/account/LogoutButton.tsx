"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onClick() {
    setSubmitting(true);
    await fetch("/api/users/logout", { method: "POST" }).catch(() => undefined);
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={submitting}
      className="rounded border border-black/20 px-4 py-2 text-sm hover:bg-black/5 disabled:opacity-50"
    >
      {submitting ? "Signing out…" : "Sign out"}
    </button>
  );
}

export default LogoutButton;
