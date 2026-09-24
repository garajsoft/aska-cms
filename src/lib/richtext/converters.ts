import type { HTMLConverter, HTMLConverters } from "@payloadcms/richtext-lexical/html";

/**
 * Payload's default upload-node HTML converter ignores custom fields, so the
 * `width` our admin drag handle writes into the node never reaches the public
 * site. Wrap the default converters: any upload node whose fields carry a
 * width renders its <img> with that width applied inline.
 *
 * Usage: convertLexicalToHTML({ data, converters: ({ defaultConverters }) => withUploadWidth(defaultConverters) })
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withUploadWidth<T extends { [key: string]: any; type?: string }>(
  defaultConverters: HTMLConverters<T>
): HTMLConverters<T> {
  const upload = (defaultConverters as Record<string, HTMLConverter | undefined>)
    .upload;
  if (typeof upload !== "function") return defaultConverters;
  return {
    ...defaultConverters,
    upload: ((args: { node: { fields?: { width?: unknown } } }) => {
      const html = (upload as (a: unknown) => string)(args);
      const width = args.node.fields?.width;
      if (typeof width !== "string" || !width.trim()) return html;
      const safe = width.replace(/["'<>]/g, "");
      return html.replace("<img", `<img style="width:${safe}"`);
    }) as HTMLConverters<T>["upload"],
  };
}
