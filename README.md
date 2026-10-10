# Vista

Everything your household owns, everywhere. Vista tracks net worth across banks, brokers, crypto, pensions and property, in several countries and currencies, for a whole household.

Vista is built for households whose money is spread across borders, for example between Europe and South Africa, which mainstream trackers cover poorly.

> **Status: prototype.** The app runs on demo data (`lib/mock-data.ts`). Live bank and broker connections are being built. See [Data sources](#data-sources).

## Self-hosted by design

Vista runs on your own machine or your own Cloudflare account. You bring your own API keys for each bank, broker or wallet, so your financial data never passes through anyone else's servers, including ours.

## Run it

Requires Node.js 22.13 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Check the demo data:

```bash
node scripts/check-data.mjs
```

## Make it yours

Edit `lib/household.ts` to set the two people in your household. Assets you own together go under **Joint**.

## Data sources

These sources work in prototype scripts and are being wired into the app. Each one uses your own credentials, created in that provider's developer portal.

| Source                                                    | Covers                                                                             | How                                                |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| [Enable Banking](https://enablebanking.com)               | Banks in 29 EU countries (e.g. Revolut, BNP, Wise), cash balances and transactions | Free "restricted" app linked to your own accounts  |
| [Investec](https://developer.investec.com)                | Investec South Africa accounts and transactions                                    | Your personal API key                              |
| [Interactive Brokers](https://www.interactivebrokers.com) | Positions and cash                                                                 | Flex Query token                                   |
| [Plaid](https://plaid.com)                                | US banks and US stock plans (e.g. Shareworks)                                      | Your own Plaid developer account                   |
| Bitcoin and Ethereum wallets                              | Balances                                                                           | Public addresses or xpubs only, never private keys |
| Anything else                                             | Property, pensions, private equity, other brokers                                  | Manual entry or statement import                   |

All connections are read-only. Vista never moves money.

## Want a hosted version?

If you'd rather not set up API keys, a hosted Vista may come later. [Join the waitlist](../../issues/new?template=hosted-waitlist.yml) so we know it's worth building.

## Stack

React 19 on [vinext](https://github.com/cloudflare/vinext) (Next.js-style App Router on Vite), Tailwind 4, shadcn / Base UI and Recharts. Deploys to Cloudflare Workers with wrangler.

## License

[AGPL-3.0](LICENSE). You can use, change and self-host Vista freely. If you run a modified version as a service for others, you must share your changes under the same license.
