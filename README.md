# Saikat Chowdhury portfolio

A local portfolio built with Vite, vanilla JavaScript, and Three.js. The portfolio runs without credentials. Direct contact-form delivery uses a server-only Hostinger SMTP connection.

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
- `src/themes.js`: eight accent colors and local preference persistence.
- `src/contact.js`: popup form, validation feedback, and delivery states.
- `server/contact.js` and `vite.config.js`: SMTP delivery endpoint, available in development and preview.
- `src/scene.js`: optional Three.js scene, with visibility and reduced-motion controls.
- `src/main.js`: filters, command palette, dialogs, live local time, and contact actions.
- `public/assets/`: local images copied from the original portfolio and supplied Desktop projects.

Add another object to `projects` in `src/data.js` to add a project. Project counts, categories, details, and command-palette entries derive from this data. Use category `web`, `ai`, or `plugins`. Add screenshot paths under `public/assets` and reference them as `/assets/name.webp`.

## Behavior

- Cmd/Ctrl+K opens local portfolio search. Arrow keys select; Enter opens; Escape closes.
- Projects have working category filters, an expandable archive, and detail dialogs.
- Native dialog focus containment and focus restoration support keyboard use.
- The motion control pauses the WebGL scene, cursor motion, and CSS animations. Operating-system reduced-motion preferences are respected.
- The WebGL scene stops rendering outside the viewport and when the tab is hidden. If WebGL is unavailable, the portrait and CSS decoration remain.
- The contact popup offers direct email plus an SMTP-backed form. A successful form submission is reported only after SMTP accepts the message for `hi@saikatchowdhury.com`.
- Visitor email goes in Reply-To, while the authenticated mailbox is the sender. Form input is validated on the server. The endpoint includes same-origin checks, a honeypot, a body-size limit, and an in-memory per-address rate limit.
- The chosen accent color is remembered locally and updates interface colors, diagrams, and Three.js materials.
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

The form reports unavailable until the password is configured. `npm run preview` also includes the endpoint. A static-only deployment of `dist/` will not include the server handler: production hosting must run a Node/serverless adapter for `server/contact.js` and set the same server-side variables. The in-memory rate limiter is for this single-process local server; use shared limiting when deploying multiple instances.

Technical references: [Nodemailer SMTP](https://nodemailer.com/smtp), [Vite plugin server hooks](https://vite.dev/guide/api-plugin.html).
