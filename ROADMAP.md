# Aska roadmap

Ongoing direction: everything becomes pure aska over time. Payload and
GrapesJS are current dependencies we replace with our own components as
we go, so a customer installation is a single self-contained image with
no third-party admin surface, no external services, no per-customer
signups to anything.

## Deferred: embedded analytics (own-your-own, no external service)

Ship as part of the base image so a fresh SaaS provisioning has real
numbers on day one — nothing to configure, no cross-service dep.

MVP scope:
- `pageviews` collection — path, referrer, ua, country, session cookie id, timestamp
- Anonymous beacon injected server-side in root `layout.tsx` (no consent flow needed — no PII)
- `POST /api/track` writes rows
- Country from edge headers (`CF-IPCountry`, `X-Vercel-IP-Country`); GeoLite2 as optional add-on
- Dashboard "Site traffic" widget: real 28-day chart + top pages + top referrers + country breakdown

Out of MVP:
- Time-on-page (needs heartbeat + bfcache handling)
- Funnels, cohorts, retention
- Session replay

## Deferred: replace Payload with pure aska admin

Long game. Migrate admin surface piece by piece so we can eventually
drop the payload dependency:
1. Custom admin routes + auth
2. Custom collection CRUD screens
3. Custom rich-text editor
4. Custom media library

Each piece can live alongside Payload while it's being built, then swap.

## Deferred: replace GrapesJS with pure aska page builder

Similar migration. Grapes stays until we've built:
1. Own canvas + block palette
2. Own component tree + selection model
3. Own inline text editing
4. Own template placeholder editing (already own the render engine)

## Deferred: SaaS provisioning

Signup flow that:
1. Provisions a new aska container + Postgres per customer
2. Assigns a temporary subdomain (`<slug>.aska.host`)
3. Onboards a first admin user
4. Wires custom domain when the customer adds one

Coolify API + a small orchestrator service can drive this; specifics
depend on which host we run the fleet on.
