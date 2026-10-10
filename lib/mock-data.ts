import type {
  Account,
  Connection,
  Currency,
  Holding,
  Household,
  Institution,
  NetWorthSnapshot,
  Owner,
  OwnerFilter,
} from './models';
import { members, owners } from './household.ts';
const [A, B] = members;
export const household: Household = {
  id: 'home',
  name: 'Our household',
  owners: [...owners],
  baseCurrency: 'EUR',
};
export const fx: Record<Currency, number> = {
  EUR: 1,
  USD: 1.09,
  ZAR: 19.7,
  GBP: 0.85,
  CHF: 0.96,
};
export const institutions: Institution[] = [
  {
    id: 'investec',
    name: 'Investec',
    short: 'in',
    color: '#202d3b',
    category: 'Banks',
    method: 'Automatic',
  },
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    short: 'IB',
    color: '#b23342',
    category: 'Investments',
    method: 'Automatic',
  },
  {
    id: 'ee',
    name: 'EasyEquities',
    short: 'ee',
    color: '#dd472e',
    category: 'Investments',
    method: 'Experimental',
  },
  {
    id: 'shareworks',
    name: 'Shareworks',
    short: 'sw',
    color: '#6672a2',
    category: 'Investments',
    method: 'Import',
  },
  {
    id: '10x',
    name: '10X',
    short: '10X',
    color: '#177e87',
    category: 'Pensions',
    method: 'Import',
  },
  {
    id: 'sygnia',
    name: 'Sygnia',
    short: 'S',
    color: '#6f5c8f',
    category: 'Pensions',
    method: 'Import',
  },
  {
    id: 'trezor',
    name: 'Trezor',
    short: 'T',
    color: '#237651',
    category: 'Crypto',
    method: 'Automatic',
  },
  {
    id: 'hello',
    name: 'Hello bank!',
    short: 'h!',
    color: '#059ac4',
    category: 'Banks',
    method: 'Automatic',
  },
  {
    id: 'revolut',
    name: 'Revolut',
    short: 'R',
    color: '#26272d',
    category: 'Banks',
    method: 'Automatic',
  },
  {
    id: 'tr',
    name: 'Trade Republic',
    short: 'TR',
    color: '#202827',
    category: 'Investments',
    method: 'Experimental',
  },
  {
    id: 'manual',
    name: 'Other assets',
    short: '+',
    color: '#7c8173',
    category: 'Other',
    method: 'Manual',
  },
];
const a = (
  id: string,
  institutionId: string,
  owner: Owner,
  name: string,
  value: number,
  currency: Currency,
  country: string,
  type: Account['type'],
  change: number,
  cash = 0,
): Account => ({
  id,
  institutionId,
  owner,
  name,
  value,
  currency,
  country,
  type,
  change,
  cash,
});
export const initialAccounts: Account[] = [
  a(
    'ee-s-zar',
    'ee',
    A,
    'ZAR Account',
    12200,
    'ZAR',
    'South Africa',
    'Public equities',
    2.4,
    400,
  ),
  a(
    'ee-s-tfsa',
    'ee',
    A,
    'TFSA',
    5700,
    'ZAR',
    'South Africa',
    'Public equities',
    1.9,
    100,
  ),
  a(
    'ee-s-usd',
    'ee',
    A,
    'USD Account',
    3100,
    'USD',
    'United States',
    'Public equities',
    3.1,
    50,
  ),
  a(
    'ee-a-zar',
    'ee',
    B,
    'ZAR Account',
    5400,
    'ZAR',
    'South Africa',
    'Public equities',
    2.1,
    120,
  ),
  a(
    'ee-a-tfsa',
    'ee',
    B,
    'TFSA',
    3000,
    'ZAR',
    'South Africa',
    'Public equities',
    1.8,
    60,
  ),
  a(
    'in-s-bank',
    'investec',
    A,
    'Private Bank Account',
    8420,
    'ZAR',
    'South Africa',
    'Cash',
    0.2,
  ),
  a(
    'in-s-save',
    'investec',
    A,
    'Savings Account',
    18000,
    'ZAR',
    'South Africa',
    'Cash',
    0.6,
  ),
  a(
    'in-a-bank',
    'investec',
    B,
    'Private Bank Account',
    12020,
    'ZAR',
    'South Africa',
    'Cash',
    0.2,
  ),
  a(
    'ib-s-usd',
    'ibkr',
    A,
    'Global investment account',
    60200,
    'USD',
    'United States',
    'Public equities',
    3.4,
    1200,
  ),
  a(
    'ib-s-eur',
    'ibkr',
    A,
    'European portfolio',
    9000,
    'EUR',
    'Germany',
    'Public equities',
    1.7,
    200,
  ),
  a(
    'ib-s-gbp',
    'ibkr',
    A,
    'UK portfolio',
    5000,
    'GBP',
    'Other',
    'Public equities',
    1.2,
    50,
  ),
  a(
    'sw-s',
    'shareworks',
    A,
    'Employee equity',
    52000,
    'USD',
    'United States',
    'Private equity',
    0,
  ),
  a(
    '10x-s',
    '10x',
    A,
    'Retirement annuity',
    46000,
    'ZAR',
    'South Africa',
    'Pension / retirement',
    1.8,
  ),
  a(
    'sy-s',
    'sygnia',
    A,
    'Preservation fund',
    24000,
    'ZAR',
    'South Africa',
    'Pension / retirement',
    2.1,
  ),
  a(
    'sy-a',
    'sygnia',
    B,
    'Retirement annuity',
    25000,
    'ZAR',
    'South Africa',
    'Pension / retirement',
    1.8,
  ),
  a(
    'tz-s',
    'trezor',
    A,
    'Hardware wallet',
    18800,
    'USD',
    'Other',
    'Crypto',
    -1.4,
  ),
  a(
    'tr-s',
    'tr',
    A,
    'Investment account',
    20000,
    'EUR',
    'Germany',
    'Public equities',
    2.2,
    300,
  ),
  a(
    'tr-a',
    'tr',
    B,
    'Investment account',
    18000,
    'EUR',
    'Germany',
    'Public equities',
    2.2,
    200,
  ),
  a(
    'h-a',
    'hello',
    B,
    'Current & savings',
    18000,
    'EUR',
    'France',
    'Cash',
    0.1,
  ),
  a('r-a', 'revolut', B, 'GBP savings', 8000, 'GBP', 'Other', 'Cash', 0.3),
  a(
    'r-j',
    'revolut',
    'Joint',
    'Shared savings',
    11400,
    'EUR',
    'Other',
    'Cash',
    0.2,
  ),
  a(
    'm-s',
    'manual',
    A,
    'Seed-stage company equity',
    20000,
    'GBP',
    'Other',
    'Private equity',
    0,
  ),
  a(
    'm-j-home',
    'manual',
    'Joint',
    'Cape Town apartment · equity interest',
    65000,
    'ZAR',
    'South Africa',
    'Property',
    0.5,
  ),
  a(
    'm-j-debt',
    'manual',
    'Joint',
    'Property loan',
    -40000,
    'ZAR',
    'South Africa',
    'Debt',
    0,
  ),
];
export const initialConnections: Connection[] = institutions
  .filter((i) => i.id !== 'manual')
  .flatMap((i) =>
    household.owners
      .filter((owner) =>
        initialAccounts.some(
          (a) => a.institutionId === i.id && a.owner === owner,
        ),
      )
      .map(
        (owner) =>
          ({
            id: `${i.id}-${owner}`,
            institutionId: i.id,
            owner,
            status:
              i.id === 'tr' && owner === A
                ? 'Needs attention'
                : i.method === 'Import'
                  ? 'Imported'
                  : 'Connected',
            lastSynced:
              i.method === 'Import'
                ? '2 days ago'
                : i.id === 'tr' && owner === A
                  ? '2 days ago'
                  : '4 min ago',
          }) as Connection,
      ),
  );
export const assetColors: Record<string, string> = {
  'Public equities': '#16241e',
  Cash: '#7fa36b',
  'Private equity': '#a9c98f',
  Crypto: '#8e9db8',
  'Pension / retirement': '#3e6b53',
  Property: '#d3bc8a',
  Debt: '#b97c6e',
  Other: '#b5b0a5',
};
export const ownerColors = {
  [A]: '#16241e',
  [B]: '#9fc479',
  Joint: '#ddd8cb',
};
export function filterByOwner<T extends { owner: Owner }>(
  items: T[],
  owner: OwnerFilter,
) {
  return owner === 'Household'
    ? items
    : items.filter((item) => item.owner === owner);
}
export const sum = (items: { value: number }[]) =>
  items.reduce((n, a) => n + a.value, 0);
// Values are stored in EUR; native account values are derived with fixed illustrative rates.
export const snapshots: NetWorthSnapshot[] = Array.from(
  { length: 549 },
  (_, i) => {
    const date = new Date(Date.UTC(2025, 2, 8 + i));
    const t = i / 548;
    const growth =
      0.72 +
      0.28 * t +
      Math.sin(i / 17) * 0.009 +
      Math.sin(i / 5) * 0.002 -
      Math.exp(-Math.pow((i - 50) / 24, 2)) * 0.055;
    const last =
      0.72 + 0.28 + Math.sin(548 / 17) * 0.009 + Math.sin(548 / 5) * 0.002;
    return {
      date: date.toISOString().slice(0, 10),
      [A]: (302420 * growth) / last,
      [B]: 89420 * (0.82 + 0.18 * t),
      Joint: 36400 * (0.94 + 0.06 * t),
    };
  },
);
export const periods = ['1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const;
export type Period = (typeof periods)[number];
export function historyFor(owner: OwnerFilter, period: Period, added = 0) {
  const cutoffs: Record<Period, string> = {
    '1M': '2026-08-07',
    '3M': '2026-06-07',
    '6M': '2026-03-07',
    YTD: '2026-01-01',
    '1Y': '2025-09-07',
    ALL: '2025-03-08',
  };
  return snapshots
    .filter((s) => s.date >= cutoffs[period])
    .map((s) => ({
      date: s.date,
      value:
        (owner === 'Household' ? s[A] + s[B] + s.Joint : s[owner]) +
        (s.date === '2026-09-07' ? added : 0),
    }));
}
export function holdingsFor(account: Account): Holding[] {
  if (account.type !== 'Public equities') return [];
  const total = account.value - (account.cash || 0);
  return [
    ['Vanguard FTSE All-World', 'VWCE', 0.35, 124.5],
    ['iShares Core S&P 500', 'CSPX', 0.25, 546.2],
    ['Apple', 'AAPL', 0.15, 207.8],
    ['Microsoft', 'MSFT', 0.15, 391.4],
    ['iShares Core MSCI World', 'IWDA', 0.1, 96.1],
  ].map(([name, ticker, weight, price], i) => ({
    name: String(name),
    ticker: String(ticker),
    quantity: (total * Number(weight)) / Number(price),
    price: Number(price),
    cost: (total * Number(weight)) / (1.08 + i * 0.023),
  }));
}
