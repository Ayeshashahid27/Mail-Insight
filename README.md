# MailSense AI

MailSense AI is a React dashboard for the existing n8n email analytics workflow. It reads saved rolling email snapshots, shows the latest AI briefing, explores category counts and historical trends, and exports reports from source data.

## Local development

Requirements: Node.js 20.19+ and npm.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set your real webhook URL in `.env.local`, then open the local URL printed by Vite. The frontend requests `/api/insights`; Vite proxies that route to `VITE_MAILSENSE_API_URL` because the n8n webhook does not currently return a browser CORS permission header. The endpoint is not authenticated, so local use should remain on a trusted machine and network. Never commit `.env.local` or a report containing private email information.

```powershell
npm test
npm run lint
npm run build
```

## Data behavior

The live webhook returns `{ ok, latest, history, available_days, scope }`. The normalizer accepts that wrapper, arrays, records, and several common array wrappers. It parses numeric strings and serialized JSON, filters invalid dates, removes an exact duplicate of `latest` in `history`, and sorts chronologically. Missing values remain missing. The interface warns if the backend marks a scan as possibly truncated or if all category counts are present but differ from `total`.

Historical charts show values per saved snapshot. Rolling previous-24-hour windows can overlap, so the app never adds them into a purported unique weekly total. Charts needing two data points show an insufficient-data state until another snapshot exists.

## Vercel deployment

The repository includes `api/insights.js`, a same-origin Vercel function. In Vercel project settings, set two **server-side** environment variables:

- `MAILSENSE_API_URL`: the n8n GET webhook URL.
- `MAILSENSE_ACCESS_TOKEN`: a long, random access key shared only with authorized viewers.

Do not prefix either secret with `VITE_`. The function fails closed if either variable is absent and requires `Authorization: Bearer <key>`. Authorized viewers enter the key in Settings; it is kept in `sessionStorage` for that tab. Use HTTPS, control who receives the key, and rotate it when access changes. A shared key is basic protection; use a full identity provider and user-scoped authorization before a broader public rollout. The direct n8n webhook still has no authentication, so its URL remains a separate exposure until the workflow itself is protected or restricted. Vercel Deployment Protection can provide another access layer for the frontend.

`VITE_MAILSENSE_API_URL` is used for the local Vite proxy. The deployed function uses `MAILSENSE_API_URL`, and the production interface does not display the source URL.

## Privacy and limitations

The workflow can return information derived from private Gmail messages. This app does not contain Gmail OAuth credentials, Google Sheets credentials, or NVIDIA keys. It does not change the n8n schedule or the AI model. Category counts are aggregate data; individual email records are shown only when the backend supplies details in `urgent_emails`. Preferences are saved in browser local storage. The access key is saved only for the current browser tab.
