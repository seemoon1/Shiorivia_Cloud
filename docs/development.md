# Cloud Edition development / 云端版开发

## Prerequisites / 环境

- Git; Node.js and npm (currently Next.js 14.1.0).
- Provider API keys only when testing real BYOK model requests. Never add production keys to the repository.

## Run locally / 本地启动

```powershell
cd E:\Projects\Shiorivia_Cloud  # Replace with your own checkout path
npm ci
npm run dev
```

Open `http://localhost:3000`. The Cloud app uses BYOK; provider keys are entered in the browser, so no provider API key is needed in `.env.local` for normal local use.

For optional local site-lock testing, copy the **comment-only** example and fill in your own values:

```powershell
Copy-Item .env.example .env.local
```

Do not put real credentials in `.env.example`, Git history, Docker build contexts, or Issues. Set Vercel production/preview environment variables privately in the Vercel dashboard; a repository template does not configure Vercel.

## Preview and production / 预览与正式版

- `dev` is the preview branch; `main` deploys to production at `https://app.shiorivia.com`. Submit changes to `dev` for preview validation; promote tested changes to `main` after review. Prefer pull requests; avoid force pushes and unrelated history rewrites. Preview links and access settings are managed in Vercel.
- A Vercel URL that looks accessible is **not** proof the preview is private. Check Deployment Protection before sharing previews.
- Browser `localStorage` holds BYOK keys and chat history; it is **not encrypted**. Relevant key/prompt material also passes through the Cloud server proxy during provider requests. Read [SECURITY.md](../SECURITY.md).
- The old server-side routes `/api/run`, `/api/upload`, `/api/local/sync`, and `/api/local/slots*` are disabled intentionally. Do not bring them back to enable features without a proper trust and storage design.

## Verify / 验证

```powershell
npx tsc --noEmit
npm run build
```

The legacy Next.js 14 build currently ignores some TypeScript/ESLint errors via `next.config.mjs`. Dependency upgrades, explicit checks, rate limits and a full security review are required before dropping preview protection or declaring the hosted demo production-hardened.
