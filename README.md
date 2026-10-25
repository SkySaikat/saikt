# Saikat Chowdhury portfolio

A local portfolio built with Vite, vanilla JavaScript, and Three.js. No backend or API keys are required.

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
- `src/style.css`: design, layout, responsive styles, and motion preferences.
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
- The contact form composes a `mailto:` draft for review in the visitor’s email application. It does not submit or store messages.
- Fonts and images are served locally. External destinations are only opened when visitors follow links.

## Next content

Wonder Block Oscillator, additional plugins, additional screenshots, and any new project URLs can be added when supplied. Gemini is intentionally not integrated: the chosen first version uses local portfolio search.

See `CONTENT-SOURCES.md` for provenance and unresolved links.
