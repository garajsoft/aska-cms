# åska CMS Visual Builder

## Features

### Pre-built Components (Drag & Drop)

#### Layout Components
- **Hero section** — Large hero with gradient background, title, description, and CTA button
- **Features grid (3 cols)** — Three-column layout for feature highlights
- **Call-to-action** — CTA section with heading and action button
- **Testimonial card** — Styled testimonial quote with attribution
- **Pricing table** — Three-tier pricing layout with compare columns
- **Footer** — Multi-column footer with links and copyright

#### Content Components
- **Fields** — Auto-populated placeholders for dynamic content
  - Title
  - Slug
  - Any custom collection fields (blog posts, products, etc.)

#### Collection Loops
- **Posts loop** — Displays all blog posts with title and excerpt
- **Products loop** — Grid of products with price and "Add to cart" button

### Design System

**Color Scheme:** White background with blue (#667eea) accents
- Primary: #667eea (blue)
- Background: #f8f9fa (light gray)
- Text: #333 (dark)
- Accents: Gradients and hover states in blue

### Icon System

All block types have SVG icons for quick identification:
- Heading, paragraph, button, image, grid layouts
- Dividers, spacers, quotes, lists
- Table, video, form, code blocks

### How to Use

1. Go to `/editor?slug=pagename` to edit a page
2. Browse block categories in the right sidebar
3. Drag components onto the canvas
4. Click to edit content, text, and styling
5. Click "Save" when done

### Customization

All components use inline styles for maximum portability. Edit via:
- GrapesJS canvas: Double-click to edit text, colors, spacing
- Code view: View/edit raw HTML and CSS
- Component blocks: Drag pre-built sections and customize

### Limitations & Next Steps

**Current:**
- GrapesJS plugin-based (Payload handles storage)
- CSS exported inline
- No custom component builder yet

**Future:**
- Replace GrapesJS with custom åska builder
- Add advanced typography/spacing controls
- Component variants and design tokens
- Responsive breakpoint editor
- Template inheritance
