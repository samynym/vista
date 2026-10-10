'use client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import {
  assetColors,
  historyFor,
  initialAccounts,
  ownerColors,
  periods,
  sum,
  type Period,
} from '@/lib/mock-data';
import { useWealth } from '@/lib/wealth-context';
import { Avatar, OwnerToggle, PanelTitle } from './primitives';
import { owners as allOwners } from '@/lib/household';
const periodText: Record<Period, string> = {
  '1M': 'this month',
  '3M': 'in 3 months',
  '6M': 'in 6 months',
  YTD: 'this year',
  '1Y': 'in the past year',
  ALL: 'in 18 months',
};
export function NetWorth() {
  const w = useWealth();
  const [period, setPeriod] = useState<Period>('YTD');
  const added =
    w.total -
    sum(
      initialAccounts.filter(
        (a) => w.owner === 'Household' || a.owner === w.owner,
      ),
    );
  const data = historyFor(w.owner, period, added);
  const delta = w.total - data[0].value;
  const pct = (delta / data[0].value) * 100;
  const assets = sum(w.filtered.filter((a) => a.value > 0));
  const debts = sum(w.filtered.filter((a) => a.value < 0));
  const institutionCount = new Set(
    w.filtered
      .filter((a) => a.institutionId !== 'manual')
      .map((a) => a.institutionId),
  ).size;
  return (
    <section className="hero" aria-label="Net worth">
      <div className="hero-summary">
        <OwnerToggle dark />
        <div>
          <h1 className="hero-label">
            {w.owner === 'Household'
              ? 'Household net worth'
              : `${w.owner}’s net worth`}
          </h1>
          <div className="hero-number" data-testid="net-worth">
            {w.money(w.total)}
          </div>
          <div className="hero-change">
            <span className="hero-chip">
              {delta >= 0 ? '+' : '−'}
              {w.money(Math.abs(delta))}
            </span>
            <span>
              {delta >= 0 ? 'up' : 'down'} {Math.abs(pct).toFixed(1)}%{' '}
              {periodText[period]}
            </span>
          </div>
        </div>
        <dl className="hero-equation" aria-label="How net worth is calculated">
          <div>
            <dt>Assets</dt>
            <dd>{w.money(assets)}</dd>
          </div>
          <span className="op" aria-hidden="true">
            −
          </span>
          <div>
            <dt>Debts</dt>
            <dd>{w.money(Math.abs(debts))}</dd>
          </div>
          <span className="op" aria-hidden="true">
            =
          </span>
          <div className="result">
            <dt>Net worth</dt>
            <dd>{w.money(w.total)}</dd>
          </div>
        </dl>
      </div>
      <div className="hero-chart">
        <fieldset className="segmented on-dark small" aria-label="Chart period">
          {periods.map((p) => (
            <button
              key={p}
              aria-pressed={p === period}
              className={p === period ? 'selected' : ''}
              onClick={() => setPeriod(p)}
            >
              {p === 'ALL' ? 'All' : p}
            </button>
          ))}
        </fieldset>
        <div
          className="net-chart"
          aria-label={`${period} net worth chart for ${w.owner}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                minTickGap={60}
                tick={{ fill: '#a9b4ad', fontSize: 13 }}
                tickFormatter={(v) =>
                  new Date(v + 'T12:00:00').toLocaleDateString('en-GB', {
                    month: 'short',
                    ...(period === '1M' ? { day: 'numeric' as const } : {}),
                  })
                }
                dy={10}
              />
              <YAxis hide domain={['dataMin - 6000', 'dataMax + 4000']} />
              <Tooltip
                cursor={{ stroke: '#c9e3a5', strokeOpacity: 0.4 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="chart-tooltip">
                      <span>
                        {new Date(
                          String(label) + 'T12:00:00',
                        ).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <strong>{w.money(Number(payload[0].value))}</strong>
                    </div>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#c9e3a5"
                strokeWidth={3}
                fill="#c9e3a5"
                fillOpacity={0.12}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="hero-foot">
          Updated 4 minutes ago · {institutionCount} institutions ·{' '}
          {w.filtered.length} accounts
        </p>
      </div>
    </section>
  );
}
/** Who owns what share of the household. */
export function Ownership() {
  const w = useWealth();
  const owners = allOwners.filter((o) => w.filtered.some((a) => a.owner === o));
  return (
    <section className="panel">
      <PanelTitle title="Who owns what" />
      {owners.length > 1 && (
        <div className="split-bar" aria-hidden="true">
          {owners.map((o) => (
            <span
              key={o}
              style={{
                background: ownerColors[o],
                flex: Math.max(sum(w.filtered.filter((a) => a.owner === o)), 0),
              }}
            />
          ))}
        </div>
      )}
      <div className="owner-rows">
        {owners.map((o) => {
          const val = sum(w.filtered.filter((a) => a.owner === o));
          return (
            <div key={o} className="owner-row">
              <Avatar owner={o} />
              <span className="owner-name">{o}</span>
              <span className="owner-value">
                <strong>{w.money(val)}</strong>
                <span>{Math.round((val / w.total) * 100)}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
const typeLabels: Record<string, string> = {
  'Public equities': 'Stocks & ETFs',
  'Pension / retirement': 'Retirement',
};
/** How the household's assets are split by type. */
export function Allocation() {
  const w = useWealth();
  const data = Object.entries(assetColors)
    .map(([name, color]) => ({
      name,
      label: typeLabels[name] ?? name,
      color,
      value: sum(w.filtered.filter((a) => a.type === name)),
    }))
    .filter((a) => a.value !== 0);
  const gross = sum(data.filter((a) => a.value > 0));
  const positive = data
    .filter((a) => a.value > 0)
    .sort((a, b) => b.value - a.value);
  const debt = data.filter((a) => a.value < 0);
  return (
    <section className="panel">
      <PanelTitle
        title="How it’s invested"
        aside={<span className="panel-aside">{w.money(gross)} in assets</span>}
      />
      <div className="bar-rows">
        {positive.map((d) => (
          <div key={d.name} className="bar-row">
            <div className="bar-line">
              <span>{d.label}</span>
              <span>
                <span className="bar-amount">{w.money(d.value)}</span>
                <strong>{Math.round((d.value / gross) * 100)}%</strong>
              </span>
            </div>
            <div className="bar-track">
              <i
                style={{
                  width: `${(d.value / gross) * 100}%`,
                  background: d.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {debt.map((d) => (
        <div key={d.name} className="debt-line">
          <span>{d.label}</span>
          <strong>−{w.money(Math.abs(d.value))}</strong>
        </div>
      ))}
    </section>
  );
}
const countryCodes: Record<string, string> = {
  'South Africa': 'ZA',
  France: 'FR',
  'United States': 'US',
  Germany: 'DE',
};
const currencySymbols: Record<string, string> = {
  EUR: '€',
  USD: '$',
  ZAR: 'R',
  GBP: '£',
};
const barShades = ['#16241e', '#3e6b53', '#7fa36b', '#a9c98f', '#d3cfc4'];
export function Exposure({ kind }: { kind: 'geography' | 'currency' }) {
  const w = useWealth();
  const positive = w.filtered.filter((a) => a.value > 0);
  const gross = sum(positive);
  const geo = kind === 'geography';
  const names = geo
    ? ['South Africa', 'France', 'United States', 'Germany', 'Other']
    : ['EUR', 'USD', 'ZAR', 'GBP', 'Other'];
  const data = names
    .map((name) => ({
      name,
      value: sum(
        positive.filter((a) =>
          geo
            ? name === 'Other'
              ? !(a.country in countryCodes)
              : a.country === name
            : name === 'Other'
              ? !(a.currency in currencySymbols)
              : a.currency === name,
        ),
      ),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
  return (
    <section className="panel">
      <PanelTitle title={geo ? 'Where it’s held' : 'Currencies'} />
      <div className="bar-rows">
        {data.map((d, i) => (
          <div className="bar-row with-chip" key={d.name}>
            <span className="code-chip" aria-hidden="true">
              {d.name === 'Other' ? (
                <Globe2 size={15} />
              ) : geo ? (
                countryCodes[d.name]
              ) : (
                currencySymbols[d.name]
              )}
            </span>
            <div>
              <div className="bar-line">
                <span>{d.name === 'Other' ? 'Elsewhere' : d.name}</span>
                <span>
                  <span className="bar-amount">{w.money(d.value)}</span>
                  <strong>{Math.round((d.value / gross) * 100)}%</strong>
                </span>
              </div>
              <div className="bar-track">
                <i
                  style={{
                    width: `${(d.value / gross) * 100}%`,
                    background: barShades[Math.min(i, barShades.length - 1)],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="panel-note">
        {geo
          ? 'Based on where each asset or its custodian is located.'
          : `Converted to ${w.currency} at illustrative rates.`}{' '}
        Debts are not included.
      </p>
    </section>
  );
}
