# åska CMS - Full Capabilities Reference

## GrapesJS Plugins Loaded

All available GrapesJS plugins are now enabled to unlock maximum design flexibility:

### Core Plugins
- **grapesjs-preset-webpage** — Full webpage builder foundation
- **grapesjs-blocks-basic** — Standard HTML blocks (text, images, dividers, etc.)
- **grapesjs-blocks-flexbox** — Flexbox layout components
- **grapesjs-plugin-forms** — Form elements and validation

### Advanced Features
- **grapesjs-component-countdown** — Countdown timer components
- **grapesjs-navbar** — Navigation bar builder
- **grapesjs-tabs** — Tab interface components
- **grapesjs-tooltip** — Tooltip/help text blocks
- **grapesjs-style-gradient** — Gradient editor for backgrounds
- **grapesjs-lory** — Carousel/slider components
- **grapesjs-preset-newsletter** — Email template components
- **grapesjs-plugin-export** — Export designs to HTML/CSS

**Available in Editor at:** `/editor?slug=pagename`

---

## Payload CMS Field Types

All Payload field types are available when building custom collections:

### Text Fields
- `text` — Single line text
- `textarea` — Multi-line text
- `richText` — WYSIWYG editor with formatting, links, lists

### Numeric Fields
- `number` — Integer or decimal numbers
- `index` — Indexed field for sorting

### Date/Time
- `date` — Date picker
- `blocks` — Content blocks (not yet configured)

### Selection Fields
- `select` — Dropdown menu
- `radio` — Radio button group
- `checkbox` — Boolean toggle

### Media
- `upload` — File/image upload (stored in media library)
- `point` — Geolocation coordinates (lat/long)

### Relationships
- `relationship` — Link to other collections
- `array` — Repeatable fields

### Structure
- `group` — Nested field group
- `tabs` — Organize fields into tabs
- `collapsible` — Collapsible field sections
- `row` — Horizontal layout of fields
- `json` — Raw JSON data

### Special Fields
- `email` — Email validation
- `code` — Code editor
- `blocks` — Block-based content

---

## Payload Admin Features

### Built-in Capabilities
- ✅ Collection CRUD (Create, Read, Update, Delete)
- ✅ Draft/Publish versioning
- ✅ Search across collections
- ✅ Sort by any field
- ✅ Bulk editing
- ✅ Access control via `access.read/create/update/delete`
- ✅ Media library with image optimization
- ✅ GraphQL API
- ✅ REST API
- ✅ User authentication

### Ecommerce Plugin
- Product catalogs
- Variant management
- Inventory tracking
- Order management
- Stripe integration (payment processing)

### Storage Plugin
- Vercel Blob storage integration
- File uploads with CDN delivery
- Image optimization with Sharp

### Rich Text Editor
- Lexical editor with formatting
- Link insertion
- Code blocks
- Lists and quotes

---

## Example Collection

An **Examples** collection is included in the admin that showcases every field type. Use it as a reference when building your own collections:

**Admin Path:** `/admin/collections/examples`

This collection demonstrates:
- All text field variations
- Rich text editing
- Date/time selection
- Relationships between collections
- Nested groups and tabs
- File uploads
- Geolocation
- JSON storage

---

## What's Available Now

### In the Admin
- **Pages** — Edit landing pages with HTML/CSS
- **Blog** — Blog post collection (customizable)
- **Products** — Ecommerce products (Stripe-ready)
- **Templates** — Email/page templates with placeholders
- **Media** — Image and file library
- **Examples** — Reference collection (all field types)
- **Settings** — Global site configuration

### In the Visual Editor (`/editor`)
- Drag-and-drop page builder
- All GrapesJS plugins enabled
- 13+ component types
- Responsive editing
- Code view
- CSS styling
- Export capabilities

### APIs
- **GraphQL** at `/api/graphql`
- **REST API** via Payload routes
- **Data API** for headless usage

---

## What to Strip Away

If you want to simplify, consider removing:
- Unused GrapesJS plugins (check which blocks you actually use)
- Plugin configurations you don't need
- Fields in collections you won't use
- Admin customizations that aren't needed

Each plugin/field adds weight to the bundle. Unused capabilities won't hurt, but cleaning them up keeps the codebase lean.

---

## Next Steps

1. **Explore the Examples collection** to understand field types
2. **Test the editor** at `/editor?slug=home`
3. **Build your own collection** by copying Examples and customizing
4. **Use the admin** at `/admin` to manage content
5. **Strip away** what you don't need for your use case

Everything is loaded and ready — pick what serves your product.
