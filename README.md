# Saikat Chowdhury portfolio

A one-page portfolio built with Vite, vanilla JavaScript, Three.js, and an Express production server. The portfolio runs without credentials. Direct contact-form delivery uses a server-only Hostinger SMTP connection.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173/. The development server binds to loopback only and uses a fixed port.

```sh
npm run build
npm run preview
```

The production build is written to `dist/`. Production preview uses http://127.0.0.1:4173/.

## Edit content

- `src/data.js`: project entries, project details, categories, expertise, and searchable skills.
- `index.html`: hero, about, original testimonials, contact, and navigation.
- `src/style.css` and `src/enhancements.css`: base design, theme-aware colors, entrance animation, and contact layout.
- `src/readability.css`: readable body and label sizes, text contrast, and responsive wrapping for controls and captions.
- `src/themes.js`: eight accent colors and local preference persistence.
- `src/contact.js`: popup form, validation feedback, and delivery states.
- `server.js` and `server/app.js`: production Express server for Hostinger, serving the built site and JSON API.
- `server/contact.js` and `vite.config.js`: shared SMTP handler for production, development, and preview.
- `src/contact-api.js`: defensive response parsing and useful delivery errors.
- `src/additional-projects.js`, `src/faq-data.js`, and `src/content.css`: additional sourced projects, client answers, and their presentation.
- `src/scene.js`: optional Three.js scene, with visibility and reduced-motion controls.
- `src/main.js`: filters, command palette, dialogs, live local time, and contact actions.
- `src/seo-data.js`: public identity, canonical domain, search title, and description.
- `src/project-renderer.js`: shared project and expertise markup for static HTML and interactive rendering.
- `scripts/generate-seo.js`: generates metadata, JSON-LD, static content, `public/sitemap.xml`, and `public/robots.txt`.
- `public/assets/`: local images copied from the original portfolio and supplied Desktop projects.
- `public/downloads/saikat-chowdhury-cv.pdf`: the supplied CV, served directly by the website. Replace this file to update the download; Vite includes it in `dist/downloads/` during builds.

Add another object to `projects` in `src/data.js` to add a project. Project counts, categories, details, and command-palette entries derive from this data. Use category `web`, `ai`, or `plugins`. Add screenshot paths under `public/assets` and reference them as `/assets/name.webp`.

## Behavior

- Cmd/Ctrl+K opens local portfolio search. Arrow keys select; Enter opens; Escape closes.
- Projects have working category filters, an expandable archive, and detail dialogs.
- Native dialog focus containment and focus restoration support keyboard use.
- The motion control pauses the WebGL scene, cursor motion, and CSS animations. Operating-system reduced-motion preferences are respected.
- The WebGL scene stops rendering outside the viewport and when the tab is hidden. If WebGL is unavailable, the portrait and CSS decoration remain.
- The contact popup offers direct email plus an SMTP-backed form. A successful form submission is reported only after SMTP accepts the message for `hi@saikatchowdhury.com`.
- Visitor email goes in Reply-To, while the authenticated mailbox is the sender. Form input is validated on the server. The endpoint includes same-origin checks, a honeypot, a body-size limit, and an in-memory per-address rate limit.
- Golden amber is the default accent for new visitors. A visitor’s chosen color is remembered locally and updates interface colors, diagrams, and Three.js materials.
- The preloader lifts into a staggered entrance. Reduced-motion visitors see the content immediately.
- Fonts and images are served locally. SMTP credentials stay on the server and are never included in the browser bundle.

## Next content

Wonder Block Oscillator, additional plugins, additional screenshots, and any new project URLs can be added when supplied. Gemini is intentionally not integrated: the chosen first version uses local portfolio search.

See `CONTENT-SOURCES.md` for provenance and unresolved links.

## Enable Hostinger email delivery

The `.env.local` file is already prepared with Hostinger's host, port, and mailbox. Set the mailbox password after `SMTP_PASS=` locally. Keep that file out of Git; it is ignored. For values containing `#` or spaces, wrap the value in quotes.

```dotenv
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hi@saikatchowdhury.com
SMTP_PASS="your mailbox password"
```

Restart `npm run dev` after changing SMTP settings. Run `npm run email:verify` to check authentication without sending an email. Use `npm test` for the contact endpoint's isolated tests; those do not send real email.

The form reports unavailable until the password is configured. Run `npm run build`, then `npm start` for production. `server.js` serves `dist/` and both contact endpoints through one Express process. Deploying only `dist/` as a static Vite site cannot send email. See [HOSTINGER-DEPLOYMENT.md](HOSTINGER-DEPLOYMENT.md) for settings. The in-memory rate limiter is per process; use a shared store when scaling to multiple instances. Configure `TRUST_PROXY_HOPS` only after confirming the proxy topology.

Technical references: [Nodemailer SMTP](https://nodemailer.com/smtp), [Vite plugin server hooks](https://vite.dev/guide/api-plugin.html).

## Search and indexing

The portfolio deliberately remains one page. Project buttons still open dialogs; no service or project pages were added. The sitemap contains only the canonical homepage, `https://saikatchowdhury.com/`, rather than hash sections or popup URLs.

The page includes Person, WebSite, ProfilePage, four Service entities, an ItemList, and 23 CreativeWork entities in JSON-LD. They describe the public profile, location, education, social profiles, visible expertise, and project work. Canonical, author, robots, Open Graph, and Twitter card metadata use the same identity configuration. No review stars, fabricated ratings, or business-address claims are added.

All 23 project cards, full project notes, six FAQs, and expertise rows are included in the initial HTML. Filters hide cards without removing their content from the document. Project buttons and the Project details control open the existing popups; without JavaScript, notes expand in place. Canonical project fragment links also open the matching popup. Generated blocks in `index.html` are marked with comments; edit the source data, then run `npm run seo:generate`. Vite also refreshes them during development, preview, and production builds.

The server uses Vite's multi-page mode only to return a real 404 for unknown paths instead of serving duplicate copies of the homepage. This does not add pages to the site. A production host should also return 404 for unknown paths and serve the sitemap and robots files from the domain root.

### When this version replaces the live website

1. Keep `https://saikatchowdhury.com/` as the canonical HTTPS address and redirect alternate hostnames to it. Review old WordPress URLs before migration and preserve useful pages or redirect them to an appropriate equivalent; do not redirect every missing URL to the homepage. The CV now uses the bundled `/downloads/saikat-chowdhury-cv.pdf` file rather than the former WordPress upload URL.
2. Confirm `https://saikatchowdhury.com/sitemap.xml` and `/robots.txt` return these new files. Localhost cannot be crawled by Google.
3. In the verified Search Console property for this domain, submit `sitemap.xml`. No verification token is invented or embedded in this repository.
4. Use Search Console URL Inspection to test the live homepage and request indexing. Check the published markup in Google's Rich Results Test. JSON-LD describes the page; it does not guarantee a rich result or a ranking position.
5. Track impressions and clicks for “Saikat Chowdhury” and relevant web-development queries. Keep project evidence, profile details, and descriptions accurate as the portfolio grows.

Guidance: [Google's sitemap instructions](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).

## AI search discovery

The visible content explains the person, services, location, actual project scope, and common client questions. Search crawlers including Googlebot, Bingbot, and OAI-SearchBot are allowed by the wildcard robots policy; `/api/` is excluded. A hosting firewall must also allow legitimate crawlers.

The standard sitemap contains only the canonical homepage. There is no separate standard AEO sitemap. `llms.txt` is an optional generated text guide using the same public content; Google does not use it for visibility or rankings. It does not replace HTML or Search Console. FAQs are useful visible answers, without a promise of Google FAQ rich results.

After release, submit the sitemap in Google Search Console and Bing Webmaster Tools, inspect the homepage, and monitor actual impressions, queries, and crawl errors. Rankings and AI citations cannot be guaranteed. If the older Vercel portfolio is retired, redirect its URLs to matching sections or project anchors on the canonical domain. This repository does not control that other deployment.

References: [Google AI-search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [OpenAI search crawler guidance](https://developers.openai.com/api/docs/bots).
