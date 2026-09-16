import { getPayload } from "payload";
import config from "../src/payload.config";

async function seed() {
  const payload = await getPayload({ config });

  // Create initial admin user
  const existingUser = await payload.find({ collection: "users", limit: 1 });
  let adminUser = existingUser.docs[0];

  if (!adminUser) {
    payload.logger.info("Creating initial admin user...");
    adminUser = await payload.create({
      collection: "users",
      data: {
        email: "admin@aska.local",
        password: "changeme123",
      },
    });
    payload.logger.info(`✓ Created user: ${adminUser.email}`);
  } else {
    payload.logger.info(`✓ Admin user already exists: ${adminUser.email}`);
  }

  // Create landing page
  const landingHtml = `<div style="max-width: 1200px; margin: 0 auto; padding: 60px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <header style="margin-bottom: 80px; text-align: center;">
    <h1 style="font-size: 48px; font-weight: 700; margin: 0 0 16px; color: #000;">åska CMS</h1>
    <p style="font-size: 18px; color: #666; margin: 0; max-width: 600px; margin-left: auto; margin-right: auto;">A lightweight, open-source CMS built for modern web teams. Visual page builder, Stripe ecommerce, and headless content API included.</p>
  </header>

  <section style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-bottom: 80px;">
    <div>
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #000;">Visual Builder</h3>
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">Edit pages with GrapesJS. No coding required for basic layouts.</p>
    </div>
    <div>
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #000;">Headless Ready</h3>
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">GraphQL & REST APIs for any frontend. Connect Next.js, React, or static sites.</p>
    </div>
    <div>
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #000;">Ecommerce Built-in</h3>
      <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">Stripe integration for products, payments, and subscriptions.</p>
    </div>
  </section>

  <section style="background: #f5f5f5; padding: 40px; border-radius: 8px; text-align: center;">
    <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #000;">Roadmap</h2>
    <p style="margin: 0 0 20px; font-size: 14px; color: #666; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.6;">
      Building åska as a reusable platform. Long-term: replace Payload &amp; GrapesJS with our own components, embedded analytics, and managed SaaS provisioning.
    </p>
    <ul style="list-style: none; padding: 0; margin: 0; text-align: left; display: inline-block; font-size: 14px; color: #666;">
      <li style="margin-bottom: 8px;">✓ Visual page &amp; template builder</li>
      <li style="margin-bottom: 8px;">✓ Payload admin + GraphQL API</li>
      <li style="margin-bottom: 8px;">✓ Stripe ecommerce plugin</li>
      <li>→ Custom admin UI, embedded analytics, managed hosting</li>
    </ul>
  </section>

  <footer style="margin-top: 80px; padding-top: 40px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #999;">
    <p style="margin: 0;"><a href="/admin" style="color: #000; text-decoration: none; font-weight: 500;">Admin Dashboard</a> · <a href="/editor" style="color: #000; text-decoration: none; font-weight: 500; margin-left: 20px;">Page Editor</a></p>
  </footer>
</div>`;

  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" } },
    limit: 1,
  });

  let page = existing.docs[0];

  if (!page) {
    payload.logger.info("Creating landing page...");
    page = await payload.create({
      collection: "pages",
      data: {
        title: "åska CMS",
        slug: "home",
        html: landingHtml,
        css: "",
        metaDescription: "A lightweight, open-source CMS for modern web teams.",
      },
    });
    payload.logger.info(`✓ Created page: ${page.slug}`);
  } else {
    payload.logger.info(`✓ Landing page already exists`);
  }

  // Set as homepage in Settings
  payload.logger.info("Setting homepage...");
  await payload.updateGlobal({
    slug: "settings",
    data: {
      homepage: page.id,
    },
  });
  payload.logger.info(`✓ Homepage configured`);

  payload.logger.info("\n✅ Seed complete!");
  payload.logger.info(`🔗 Admin: /admin`);
  payload.logger.info(`🔗 Site: / (home)`);
  payload.logger.info(`🔗 Editor: /editor?slug=home`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => process.exit(0));
