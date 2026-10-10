import type { Account, AssetType, Connection, Currency, Owner } from './models';
import { fx, holdingsFor, institutions, snapshots, sum } from './mock-data';

export const accountGroups: { label: string; types: AssetType[] }[] = [
  { label: 'Investments', types: ['Public equities', 'Private equity'] },
  { label: 'Cash', types: ['Cash'] },
  { label: 'Retirement', types: ['Pension / retirement'] },
  { label: 'Crypto', types: ['Crypto'] },
  { label: 'Property', types: ['Property'] },
  { label: 'Other', types: ['Other'] },
  { label: 'Debt', types: ['Debt'] },
];

/** Value gained this month, from the account's monthly % change. */
export const monthlyGain = (a: Account) =>
  a.value - a.value / (1 + a.change / 100);

/** Value-weighted monthly % change across accounts. */
export function weightedChange(accounts: Account[]) {
  const total = sum(accounts);
  return total
    ? accounts.reduce((n, a) => n + a.value * a.change, 0) / total
    : 0;
}

export interface GroupRow {
  key: string;
  accountIds: string[];
  href: string;
  institutionId: string;
  name: string;
  owners: Owner[];
  count: number;
  value: number;
  change: number;
}

/** Accounts grouped by type; within a group, one row per institution (manual assets get one row each). */
export function groupAccounts(accounts: Account[]) {
  const grossAssets = sum(accounts.filter((a) => a.value > 0));
  return accountGroups
    .map((g) => {
      const inGroup = accounts.filter((a) => g.types.includes(a.type));
      const rows: GroupRow[] = [];
      for (const a of inGroup.filter((a) => a.institutionId === 'manual'))
        rows.push({
          key: a.id,
          accountIds: [a.id],
          href: `/accounts/${a.id}`,
          institutionId: a.institutionId,
          name: a.name,
          owners: [a.owner],
          count: 1,
          value: a.value,
          change: a.change,
        });
      for (const id of new Set(
        inGroup
          .filter((a) => a.institutionId !== 'manual')
          .map((a) => a.institutionId),
      )) {
        const ac = inGroup.filter((a) => a.institutionId === id);
        rows.push({
          key: `${g.label}-${id}`,
          accountIds: ac.map((a) => a.id),
          href: `/institutions/${id}`,
          institutionId: id,
          name: institutions.find((i) => i.id === id)?.name ?? id,
          owners: [...new Set(ac.map((a) => a.owner))],
          count: ac.length,
          value: sum(ac),
          change: weightedChange(ac),
        });
      }
      rows.sort((x, y) => Math.abs(y.value) - Math.abs(x.value));
      const total = sum(inGroup);
      return {
        label: g.label,
        total,
        rows,
        monthGain: inGroup.reduce((n, a) => n + monthlyGain(a), 0),
        /** Share of gross assets; null for groups that are debt. */
        share: total > 0 && grossAssets ? total / grossAssets : null,
      };
    })
    .filter((g) => g.rows.length);
}

/** The largest holding currency other than the base, and what a 10% fall would cost. */
export function currencyRisk(accounts: Account[], base: Currency) {
  const positive = accounts.filter((a) => a.value > 0);
  const gross = sum(positive);
  const byCurrency = (Object.keys(fx) as Currency[])
    .filter((c) => c !== base)
    .map((c) => ({
      currency: c,
      value: sum(positive.filter((a) => a.currency === c)),
    }))
    .sort((a, b) => b.value - a.value);
  const top = byCurrency[0];
  if (!top || !top.value || !gross) return null;
  return { ...top, share: top.value / gross, drop: top.value * 0.1 };
}

/** Debt as a share of assets, with a plain-language level. Null when there is no debt. */
export function debtRatio(accounts: Account[]) {
  const assets = sum(accounts.filter((a) => a.value > 0));
  const debt = -sum(accounts.filter((a) => a.value < 0));
  if (!debt || !assets) return null;
  const ratio = debt / assets;
  return {
    debt,
    assets,
    ratio,
    level: ratio < 0.2 ? 'low' : ratio < 0.5 ? 'moderate' : 'high',
  } as const;
}

/**
 * Daily balance for the past month. The mock data has no per-institution history,
 * so the curve follows the owners' own net-worth history over the month, scaled to
 * run from the start-of-month balance to today's balance.
 */
function monthSeries(ac: Account[]) {
  const owners = [...new Set(ac.map((a) => a.owner))];
  const days = snapshots
    .slice(-31)
    .map((s) => sum(owners.map((o) => ({ value: s[o] }))));
  const first = days[0];
  const span = days[days.length - 1] - first;
  const end = sum(ac);
  const start = ac.reduce((n, a) => n + a.value / (1 + a.change / 100), 0);
  return days.map(
    (d, i) =>
      start +
      (end - start) * (span ? (d - first) / span : i / (days.length - 1)),
  );
}

/** The institutions whose balances moved most this month, in money terms. */
export function topMovers(accounts: Account[], count = 3) {
  return [...new Set(accounts.map((a) => a.institutionId))]
    .filter((id) => id !== 'manual')
    .map((id) => {
      const ac = accounts.filter((a) => a.institutionId === id);
      return {
        institution: institutions.find((i) => i.id === id)!,
        gain: ac.reduce((n, a) => n + monthlyGain(a), 0),
        change: weightedChange(ac),
        series: monthSeries(ac),
      };
    })
    .filter((m) => m.gain !== 0)
    .sort((a, b) => Math.abs(b.gain) - Math.abs(a.gain))
    .slice(0, count);
}

/** The status a connection returns to once it syncs again. */
export const healthyStatus = (c: Connection): Connection['status'] =>
  institutions.find((i) => i.id === c.institutionId)?.method === 'Import'
    ? 'Imported'
    : 'Connected';

/** The prototype's valuation date: balances in the mock data are as of this day. */
export const VALUATION_DATE = '2026-09-07';

export interface ValueEntry {
  date: string;
  value: number;
}

/** Accounts whose value the household enters or imports by hand, rather than syncing. */
export const isManuallyValued = (a: Account) => {
  const method = institutions.find((i) => i.id === a.institutionId)?.method;
  return method === 'Manual' || method === 'Import';
};

/** Known values for an account: start of the month (from its monthly change) and the valuation date. */
export function baseValueHistory(a: Account): ValueEntry[] {
  return [
    ...(a.change !== 0
      ? [{ date: '2026-08-07', value: a.value / (1 + a.change / 100) }]
      : []),
    { date: VALUATION_DATE, value: a.value },
  ];
}

/** Daily balance of one or more accounts over the past month (see monthSeries). */
export const accountMonthSeries = (ac: Account[]) => monthSeries(ac);

/** Every account that holds a given ticker, with the value held in each. */
export function holdingAcross(ticker: string, accounts: Account[]) {
  return accounts
    .map((account) => {
      const h = holdingsFor(account).find((h) => h.ticker === ticker);
      return h
        ? { account, value: h.quantity * h.price, quantity: h.quantity }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.value - a.value);
}
