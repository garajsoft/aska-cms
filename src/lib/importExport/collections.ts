/**
 * Collections wired into the Universal JSON Import/Export engine
 * (/api/cms/export, /api/cms/import, and the admin list-view buttons).
 * Deliberately excludes `users` and `media` (binary files).
 */
export const IMPORT_EXPORT_COLLECTIONS = [
  "pages",
  "blog",
  "products",
  "templates",
  "modules",
  "components",
  "styles",
] as const;

export type ImportExportCollection = (typeof IMPORT_EXPORT_COLLECTIONS)[number];

export const isImportExportCollection = (slug: string): slug is ImportExportCollection =>
  (IMPORT_EXPORT_COLLECTIONS as readonly string[]).includes(slug);

/**
 * Field used to match an incoming record to an existing document for the
 * "Smart Upsert" (slug/unique-key match -> update, else create).
 * `modules` and `components` have no unique field in their schema, so
 * `name` is best-effort for both.
 */
export const MATCH_FIELD_BY_COLLECTION: Record<ImportExportCollection, string> = {
  pages: "slug",
  blog: "slug",
  products: "slug",
  templates: "collection",
  modules: "name",
  components: "name",
  styles: "slug",
};
