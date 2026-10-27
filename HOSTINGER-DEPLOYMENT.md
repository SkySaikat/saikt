# Hostinger production setup

The previous deployment served the Vite frontend, but its contact handler existed only in Vite's development/preview middleware. `/api/contact` therefore returned an HTML error page. The production entry point now serves the website and contact API together.

## Build settings

Use the existing `saikatchowdhury.com` GitHub-connected app and repository `SkySaikat/saikt`.

| Setting | Value |
| --- | --- |
| Framework | Express.js (a server-side app) |
| Node.js | 22.x or 24.x |
| Root directory | Repository root |
| Package manager | npm |
| Build command | `npm run build` |
| Frontend build output | `dist` |
| Entry file | `server.js` at the repository root |
| Start command, if shown | `npm start` |
| Port | Host-provided `PORT`, otherwise `3000` |

The deployment must retain `server.js`, `server/`, `package.json`, installed production dependencies, and `dist/`. The process starts from the repository root. Do not select a static Vite-only deployment or publish only `dist/`: that omits the API. In Hostinger's Express settings, retain the default application output/root layout when needed to preserve the server entry; `dist` is the directory served by Express, not a replacement for the server application.

## Runtime variables

Import the existing private `.env` values into Hostinger's environment settings, or set:

```dotenv
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hi@saikatchowdhury.com
SMTP_PASS="the existing mailbox password"
SITE_ORIGIN=https://saikatchowdhury.com
NODE_ENV=production
```

The password must remain a server environment variable, never a `VITE_` variable, a public file, or a Git commit. `SITE_ORIGIN` allows the canonical browser origin even when the hosting proxy uses an internal Host header. Redirect alternate hostnames to the canonical hostname in hosting settings.

Optional `TRUST_PROXY_HOPS` should only be set after Hostinger confirms the exact trusted proxy hop count. Without it, client forwarding headers are ignored; visitors behind a proxy can share the in-process rate limit. A distributed rate-limit store is needed if the app runs across multiple processes/instances.

## Release and verify

1. Publish the updated repository revision, select the server-side settings above, save the runtime variables, and redeploy the existing app.
2. `GET /api/contact/status` must return HTTP 200, `Content-Type: application/json`, and `{"available":true}`. This checks configuration presence, not actual inbox delivery.
3. A JSON POST with an invalid message must return a JSON validation error, not HTML. A valid inquiry is acknowledged only after Hostinger SMTP accepts the recipient. No real test message has been sent by this task.
4. Check `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/downloads/saikat-chowdhury-cv.pdf`. Unknown pages should return 404.
5. Submit `https://saikatchowdhury.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools after release. Use URL Inspection to check the live homepage.

Locally, run `npm run build && npm start`, then open `http://localhost:3000/`. `npm test` exercises the production HTTP API and browser response parser with a fake mail transport. `npm run email:verify` checks SMTP authentication without sending mail.

Hostinger references: [Node.js app deployment](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/), [redeployment](https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/).
