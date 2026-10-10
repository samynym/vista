# Vista

A household net-worth tracker. It shows everything a household owns, in every country and currency, in one place.

- Household: two members plus Joint, named in `lib/household.ts` (the demo uses Alex and Jordan). Base currency is EUR.
- Currencies: EUR, USD, ZAR, GBP, CHF.
- Asset types: public equities, cash, private equity, crypto, pensions, property, debt, other.

## Stack

- React 19 on vinext (Next.js-style App Router on Vite).
- Deployed to Cloudflare Workers with wrangler.
- Tailwind 4, shadcn / base-ui components, Recharts for charts.
- Scaffolded by OpenAI Sites (`.openai/hosting.json`, `@openai/sites-vite-plugin`).

## Current state

- Clickable prototype. No database, no auth, no backend.
- All data lives in `lib/mock-data.ts`. State is in-memory in `lib/wealth-context.tsx` and resets on refresh.
- The "Connect" flow is demo-only. It adds a fake connection row and no balances.
- Pages: overview, portfolio, assets, accounts/[id], institutions, connections, settings.

## Commands

- `npm run dev` — local dev server.
- `npm run build` — production build.
- `npm run start` — run the build with wrangler.
- `npm run lint` / `npm run format` — oxlint / oxfmt.
- `node scripts/check-data.mjs` — checks that mock-data totals, history and links are consistent. Run it after any change to `lib/mock-data.ts`.

## Conventions

- Self-hosted: every user brings their own API keys. Never commit keys, tokens, account numbers or real balances. `.env*` and `*.pem` are gitignored.
- Connections are read-only. Vista never moves money.

## Bank connections

- Plaid covers EU and UK cash balances and transactions only. Plaid Investments is US/Canada only, so EU brokers and portfolios are not covered.
- Plaid has no South African coverage (Investec, EasyEquities, 10X, Sygnia).
- Statement import and manual entry stay necessary for most accounts.
