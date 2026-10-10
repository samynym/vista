'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Check,
  ChevronDown,
  Coins,
  Scale,
  Home,
  Landmark,
  PencilLine,
  Plus,
  RefreshCw,
} from 'lucide-react';
const manualIcons: Record<string, typeof Home> = {
  Investments: Briefcase,
  Property: Home,
  Debt: Landmark,
};
import { filterByOwner, institutions } from '@/lib/mock-data';
import {
  currencyRisk,
  debtRatio,
  groupAccounts,
  healthyStatus,
  topMovers,
} from '@/lib/insights';
import { useWealth } from '@/lib/wealth-context';
import { AddFlow } from './workflows';
import { Change, Logo, PanelTitle } from './primitives';
/** Every account, grouped by type, one row per institution. */
export function AccountGroups() {
  const w = useWealth();
  const [add, setAdd] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const groups = groupAccounts(w.filtered);
  const toggle = (label: string) =>
    setCollapsed((c) =>
      c.includes(label) ? c.filter((l) => l !== label) : [...c, label],
    );
  const broken = new Set(
    filterByOwner(w.connections, w.owner)
      .filter((c) => c.status === 'Needs attention')
      .map((c) => c.institutionId),
  );
  return (
    <section className="panel accounts-panel">
      <PanelTitle
        title="Accounts"
        aside={
          <button className="button primary small" onClick={() => setAdd(true)}>
            <Plus size={15} />
            Add
          </button>
        }
      />
      {groups.map((g) => (
        <div key={g.label} className="account-group">
          <button
            className="group-head"
            aria-expanded={!collapsed.includes(g.label)}
            aria-controls={`group-${g.label}`}
            onClick={() => toggle(g.label)}
          >
            <ChevronDown size={18} className="group-chevron" />
            <span className="group-name">
              <h3>{g.label}</h3>
              <small>
                {g.monthGain !== 0 && (
                  <span className={g.monthGain < 0 ? 'down' : 'up'}>
                    {g.monthGain > 0 ? '+' : '−'}
                    {w.money(Math.abs(g.monthGain))} this month
                  </span>
                )}
                {g.monthGain !== 0 && g.share !== null && ' · '}
                {g.share !== null && `${Math.round(g.share * 100)}% of assets`}
              </small>
            </span>
            <strong>
              {g.total < 0 ? '−' : ''}
              {w.money(Math.abs(g.total))}
            </strong>
          </button>
          <div
            id={`group-${g.label}`}
            className="group-rows"
            hidden={collapsed.includes(g.label)}
          >
            {g.rows.map((r) => {
              const institution = institutions.find(
                (i) => i.id === r.institutionId,
              )!;
              const needsFix = broken.has(r.institutionId);
              return (
                <button
                  key={r.key}
                  className={`account-row ${needsFix ? 'attention' : ''}`}
                  onClick={() => w.openAccounts(r.accountIds)}
                  aria-haspopup="dialog"
                >
                  {r.institutionId === 'manual' ? (
                    <span className="institution-logo" aria-hidden="true">
                      {(() => {
                        const Icon = manualIcons[g.label] ?? PencilLine;
                        return <Icon size={18} />;
                      })()}
                    </span>
                  ) : (
                    <Logo institution={institution} />
                  )}
                  <span className="account-row-name">
                    <strong>{r.name}</strong>
                    <small>
                      {needsFix
                        ? 'Needs reconnecting'
                        : `${r.owners.join(', ')} · ${r.count} ${r.count === 1 ? 'account' : 'accounts'}`}
                    </small>
                  </span>
                  <span className="account-row-value">
                    <strong>
                      {r.value < 0 ? '−' : ''}
                      {w.money(Math.abs(r.value))}
                    </strong>
                    {r.change !== 0 ? (
                      <Change value={r.change} />
                    ) : (
                      <small>No change</small>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Link href="/assets" className="button full soft">
        Show all {w.filtered.length} accounts
      </Link>
      <AddFlow open={add} onClose={() => setAdd(false)} />
    </section>
  );
}
/** Short, plain-language notes worked out from the household's data. */
export function Insights() {
  const w = useWealth();
  const [busy, setBusy] = useState<string | null>(null);
  const [fixed, setFixed] = useState<string | null>(null);
  const broken = filterByOwner(w.connections, w.owner).filter(
    (c) => c.status === 'Needs attention',
  );
  const risk = currencyRisk(w.filtered, w.currency);
  const debt = debtRatio(w.filtered);
  function reconnect(id: string) {
    const c = w.connections.find((c) => c.id === id);
    if (!c) return;
    setBusy(id);
    setTimeout(() => {
      w.updateConnection(id, healthyStatus(c));
      setBusy(null);
      setFixed(institutions.find((i) => i.id === c.institutionId)?.name ?? '');
    }, 600);
  }
  return (
    <section className="panel">
      <PanelTitle title="Worth knowing" />
      <ul className="insights">
        {broken.map((c) => {
          const i = institutions.find((i) => i.id === c.institutionId)!;
          return (
            <li key={c.id} className="insight attention">
              <span className="insight-icon">
                <RefreshCw size={18} />
              </span>
              <div>
                <strong>{i.name} stopped syncing</strong>
                <p>
                  {c.owner}’s balance is from {c.lastSynced}. Reconnect to
                  update it.
                </p>
              </div>
              <button
                className="button dark small"
                disabled={busy === c.id}
                onClick={() => reconnect(c.id)}
              >
                {busy === c.id ? 'Fixing…' : 'Fix'}
              </button>
            </li>
          );
        })}
        {fixed && !broken.length && (
          <li className="insight">
            <span className="insight-icon good">
              <Check size={18} />
            </span>
            <div>
              <strong>{fixed} is syncing again</strong>
              <p>All your connections are up to date.</p>
            </div>
          </li>
        )}
        {risk && (
          <li className="insight">
            <span className="insight-icon">
              <Coins size={18} />
            </span>
            <div>
              <strong>
                {Math.round(risk.share * 100)}% of your assets are in{' '}
                {risk.currency}
              </strong>
              <p>
                If {risk.currency} fell 10% against {w.currency}, you would lose
                about {w.money(risk.drop)}.
              </p>
            </div>
          </li>
        )}
        {debt && (
          <li className="insight">
            <span className="insight-icon">
              <Scale size={18} />
            </span>
            <div>
              <strong>
                Your debt is {Math.round(debt.ratio * 100)}% of what you own
              </strong>
              <p>
                That is {debt.level}. You owe {w.money(debt.debt)} against{' '}
                {w.money(debt.assets)} in assets. Under 20% is low, over 50% is
                high.
              </p>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}

function Sparkline({ values, up }: { values: number[]; up: boolean }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map(
      (v, i) =>
        `${((i / (values.length - 1)) * 96).toFixed(1)},${(30 - (max === min ? 14 : ((v - min) / (max - min)) * 28)).toFixed(1)}`,
    )
    .join(' ');
  return (
    <svg
      className={`sparkline ${up ? 'up' : 'down'}`}
      viewBox="0 0 96 32"
      aria-hidden="true"
    >
      <polyline points={points} fill="none" />
    </svg>
  );
}
/** The three institutions that moved most this month. */
export function Movers() {
  const w = useWealth();
  const movers = topMovers(w.filtered);
  if (!movers.length) return null;
  return (
    <section className="panel">
      <PanelTitle
        title="Biggest moves"
        aside={<span className="panel-aside">This month</span>}
      />
      <ul className="movers">
        {movers.map((m) => (
          <li key={m.institution.id}>
            <Link href={`/institutions/${m.institution.id}`} className="mover">
              <Logo institution={m.institution} />
              <span className="mover-name">{m.institution.name}</span>
              <Sparkline values={m.series} up={m.gain >= 0} />
              <span className="mover-value">
                <strong>
                  {m.gain >= 0 ? '+' : '−'}
                  {w.money(Math.abs(m.gain))}
                </strong>
                <Change value={m.change} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
