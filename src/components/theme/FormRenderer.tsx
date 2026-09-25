"use client";

import { useState, type FormEvent } from "react";

/** Form block field, serialized server-side from the Forms collection. */
export interface SerializedFormField {
  id?: string | null;
  blockName?: string | null;
  blockType: "text" | "email" | "textarea" | "select";
  name: string;
  label: string;
  required?: boolean | null;
  options?: { label: string; value: string; id?: string | null }[] | null;
}

/**
 * Client-side renderer for a Forms collection document. Submission POSTs
 * JSON to /api/form-submissions (public create), keyed by each field's name.
 */
export function FormRenderer({
  formId,
  title,
  fields,
  submitLabel,
  confirmationHtml,
}: {
  formId: string | number;
  title: string;
  fields: SerializedFormField[];
  submitLabel: string;
  confirmationHtml: string;
}) {
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("submitting");
    const submissionData = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/form-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form: formId, submissionData }),
      });
      if (!res.ok) throw new Error(`bad status ${res.status}`);
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return confirmationHtml ? (
      <div className="text-sm [&_a]:underline" dangerouslySetInnerHTML={{ __html: confirmationHtml }} />
    ) : (
      <p className="text-sm text-zinc-600">Thanks — your submission was received.</p>
    );
  }

  const inputClass = "w-full rounded border border-black/15 px-3 py-1.5 text-sm";

  return (
    <form onSubmit={onSubmit} aria-label={title} className="flex flex-col gap-3">
      {fields.map((field, i) => {
        const key = field.id ?? i;
        const label = (
          <span className="mb-1 block text-xs font-medium text-zinc-500">{field.label}</span>
        );
        if (field.blockType === "textarea") {
          return (
            <label key={key}>
              {label}
              <textarea name={field.name} required={Boolean(field.required)} rows={4} className={inputClass} />
            </label>
          );
        }
        if (field.blockType === "select") {
          return (
            <label key={key}>
              {label}
              <select name={field.name} required={Boolean(field.required)} className={inputClass}>
                <option value="">Choose…</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        return (
          <label key={key}>
            {label}
            <input
              type={field.blockType === "email" ? "email" : "text"}
              name={field.name}
              required={Boolean(field.required)}
              className={inputClass}
            />
          </label>
        );
      })}
      {state === "error" && (
        <p className="text-sm text-red-600">Could not submit — please try again.</p>
      )}
      <button
        type="submit"
        disabled={state === "submitting"}
        className="self-start rounded bg-black px-4 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {state === "submitting" ? "Submitting…" : submitLabel}
      </button>
    </form>
  );
}

export default FormRenderer;
