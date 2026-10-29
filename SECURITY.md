# Shiorivia Cloud — Security Boundary / 安全边界

**Scope: Phase 0 preventive cleanup, not a full independent audit. / 范围：第一阶段预防性清理，并非完整审计。**

## Known changes / 已实施的防护

- `POST /api/run`: disabled. Arbitrary Python execution is never appropriate in an unauthenticated public BYOK demo.
- `/api/local/sync`, `/api/local/slots`, `/api/local/slots/read`: disabled on the **server**. Cloud save slots now use origin-scoped browser `localStorage` instead of shared server files.
- `POST /api/upload`: disabled on server to prevent untrusted writes into public filesystem; media persistence must be redesigned.
- `POST /api/auth`: no hardcoded `123456` default; only a configured `ACCESS_CODE` may be accepted.
- `/api/chat`: no full system-prompt dumps to server logs.
- fal.ai GET video polling: strict HTTPS queue-host validation; no credentials or redirects to user-controlled URL hosts.

## Trust model / 信任模型

**BYOK means “you supply the key,” not “the server never receives the key.”** The browser stores provider credentials in `localStorage` and transmits selected keys and prompt content to server-side proxy routes. The operator, hosting platform, provider and browser extensions are separate trust boundaries. Browser localStorage is not encrypted vault storage and can be lost when clearing site data.

**BYOK = 用户自备密钥，不等于服务器无法接触密钥。** 站点服务端会接收部分模型请求的密钥与正文，随后向第三方提供商转发。浏览器 localStorage 并非加密保险箱，清空站点数据会删除本地存档。

## Before public release / 正式公网发布前仍需完成

1. Upgrade and pin supported **Next.js, Node.js and transitive dependencies**, and turn on TypeScript / ESLint checks. Existing Next.js 14 settings ignore build errors; do not remove those flags until underlying issues are addressed.
2. Confirm site protection, abuse/rate limits, maximum request body sizes, timeouts, origin controls and provider-key handling; review all remaining API routes.
3. Introduce a browser-first asset store (IndexedDB or explicit user downloads) before re-enabling Cloud image persistence.
4. Test video polling with real fal.ai status/response URLs; `redirect: 'error'` is intentional and may reject changed upstream behavior.
5. Verify logs do not capture keys, user messages or personal data. Assess upstream and hosting retention policies.
6. Review third-party content rights and supply-chain integrity before declaring the public beta secure.

Until these checks are complete, **keep the Cloud demo access-protected**. The existing optional site lock is not a substitute for a full security model.

Private vulnerability reporting channel: to be published by the Shiorivia maintainers. Do not post keys or exploit details in public Issues.
