# PortfolioHub

A portfolio builder built with plain HTML, CSS and JavaScript (ES modules) on Supabase (Auth, PostgreSQL, Storage). There is no framework and no build step.

## What it does

- Sign up, log in and manage portfolios from a dashboard.
- Edit a portfolio in the builder (`portfolio-builder.html`): personal info, about, skills, experience, education, certifications, projects, services, links, template, accent colour and section visibility. Changes autosave and the preview updates as you type.
- Four templates: **Reference** (a data-driven recreation of the owner's own portfolio page), **Developer**, **Creative** and **Freelancer**. All four render from the same data.
- Publish a portfolio to get a public page at `/u/<slug>`.
- Explore published portfolios, share posts in the community feed (with optional image upload) and edit your profile.

## Project layout

| Path | Purpose |
|---|---|
| `*.html` | Pages |
| `css/` | Page styles. `css/templates/` holds the portfolio template styles |
| `js/portfolio-renderer.js` | Turns database rows into a portfolio HTML document. Used by the builder preview, the public page and the template gallery |
| `js/templates/` | One module per template (`reference.js`, `developer.js`, `creative.js`, `freelancer.js`), shared partials, icons and the iframe runtime |
| `js/portfolio-builder.js` | The editor |
| `js/portfolio-service.js` | Shared data helpers (create portfolio, public URL) |
| `supabase/migrations/` | `schema.sql`, then `002_fixes_and_templates.sql` |
| `tests/` | Offline tests (see below) |

## Setup

1. Create a Supabase project.
2. In the SQL editor run `supabase/migrations/schema.sql`, then `supabase/migrations/002_fixes_and_templates.sql`. Both are required: `002` adds columns the app reads (`template_id`, `cover_url`, `headline`, `about`, `sections`, ...), the profile relationships used by Explore and Community, and the storage buckets and policies.
3. Put your project URL and **publishable (anon) key** in `js/config.js`. Never put a `service_role` or secret key in browser code. Row Level Security protects the data.
4. In Supabase Auth settings, add your site URL and `reset-password.html` to the redirect URLs.

## Run locally

Serve the folder with any static server, for example `python3 -m http.server 8080`, and open `http://localhost:8080`. Clean `/u/<slug>` URLs need the rewrite rules, so locally the app links to `public-portfolio.html?u=<slug>` instead.

## Deploy

- **Vercel**: `vercel.json` rewrites `/u/:slug` to the public page and sends security headers. CSS and JS are revalidated on every load because the file names are not hashed.
- **Netlify**: `_redirects` contains the same rewrite.

## Adding a template

1. Create `js/templates/<id>.js` exporting `meta` (`id`, `name`, `description`, `cssPaths`, `thumb`, optional `fontsUrl`, `defaultTheme`, `supportsAccent`) and `render(model)`.
2. Add its stylesheet under `css/templates/`.
3. Register it in `TEMPLATES` in `js/portfolio-renderer.js`.

It then appears in the gallery, the builder and Explore automatically. Existing portfolios whose `template_id` is unknown fall back to Reference.

## Tests

```
cd tests
npm install
npm test
```

The tests run the page modules in jsdom against an in-memory, schema-aware stand-in for Supabase. They catch wrong column names, missing required fields, ownership mistakes and rendering problems. They do **not** talk to a real Supabase project, so row-level-security policies, storage and email flows still need a manual check against your project.
