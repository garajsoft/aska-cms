import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { withEmbed, withUploadWidth } from "@/lib/richtext/converters";

function isLexicalDoc(v: unknown): v is { root: { type: "root" } } {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as { root?: { type?: string } }).root === "object" &&
    (v as { root: { type?: string } }).root.type === "root"
  );
}

/** Walk one level; convert any lexical JSON field into an HTML string. */
export function flattenLexical(doc: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...doc };
  for (const [k, v] of Object.entries(out)) {
    if (isLexicalDoc(v)) {
      out[k] = convertLexicalToHTML({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: v as any,
        converters: ({ defaultConverters }) => withEmbed(withUploadWidth(defaultConverters)),
      });
    }
  }
  return out;
}
