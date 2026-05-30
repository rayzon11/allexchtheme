# allexchtheme

White-label configurator for Sky247-style and TigerExch-style gaming exchange themes.
Customers pick a brand colour, upload logos, check domain availability, and request the
design — all in the browser, no backend required.

## Stack

- React 18 + Vite (no TypeScript)
- Saved HTMLs of the real Sky and Tiger pages, served from `public/` and loaded into iframes
- React overlays inject brand colour, swap logos, and lock iframe navigation
- Domain availability via public RDAP (`rdap.org`) + Cloudflare DNS-over-HTTPS fallback

## Local development

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173/

## Production build

```bash
npm run build
# → dist/ is fully static, ready to drop on any host
```

## Features

- **Two themes** — Sky Exchange (dark + gold) and Tiger Exch (Materialize red)
- **Single brand colour** drives header gradients, sidenav, footer, accents — 12 presets per theme
- **Two logo slots** per theme — Primary (header) and Mark (sidenav/icon), each with size slider + auto-fit on upload
- **Home / Login** page switcher — both load the saved HTMLs directly, brand-skinned via CSS variable injection
- **Domain availability checker** — parallel-checks 8 TLDs at once, generates brand-variant suggestions
- **Order modal** — collects lead info (name, WhatsApp, email, company) and shows a request summary
- **Iframe navigation lock** — clicks inside the preview stay inside the preview

## Deploy

- Vercel / Netlify / Cloudflare Pages — drag-drop the `dist/` folder or connect this repo
- Hostinger / any Apache host — upload `dist/` contents to `public_html/`, the bundled `dist/.htaccess` handles SPA routing
