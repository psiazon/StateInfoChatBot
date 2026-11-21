# StateInfoChatUI

React + TypeScript + Vite UI for StateInfoAgent.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the existing StateInfoAgent during local development.

## IMPORTANT: verify the API contract

The UI currently sends `POST {message: string, session_id: string}` and reads common response keys (`answer`, `response`, `message`, `output`, `result`). **This is a placeholder assumption**, not a verified StateInfoAgent contract. Inspect FastAPI `/openapi.json` or `/docs` and edit the request body and `extractAnswer` in `src/App.tsx` to match. If your backend uses `thread_id`, `conversation_id`, or `question` instead, adjust accordingly.

## Azure deployment

Recommended: Azure App Service **Linux Node.js 22**. Set startup command to `pm2 serve /home/site/wwwroot --no-daemon --spa` if deploying static `dist` files via webapps-deploy. Verify startup behavior on the chosen App Service runtime; alternatively use Azure Static Web Apps.

GitHub Actions requires an Azure federated credential (OIDC) and secrets `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, repository variable `AZURE_WEBAPP_NAME`, and repository variable `VITE_AGENT_API_URL`.

Set `VITE_AGENT_API_URL` to `https://stateinfoagent-e0fvagdxf6gva7hq.westcentralus-01.azurewebsites.net/api/agent/chat` for deployed builds. **Vite env vars are embedded at build time and are public**; never store credentials in them.

### CORS

On the FastAPI StateInfoAgent service, add the exact deployed UI origin to `CORSMiddleware` allowed origins (for example `https://<your-ui-app>.azurewebsites.net`), with POST and OPTIONS and Content-Type allowed. Do not use wildcard origins with credentials. The browser makes requests directly to the agent in production; the Vite proxy works only in local development.

### Security

This starter has no user authentication. Before sharing with public users, add Entra ID sign-in, API authorization, throttling and usage controls. Browser session IDs are not authentication. A production BFF/API gateway can avoid exposing a protected agent endpoint to the browser.
