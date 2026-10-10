'use client';
import { useState, type SubmitEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, PencilLine } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  assetColors,
  fx,
  holdingsFor,
  institutions,
  sum,
} from '@/lib/mock-data';
import {
  accountMonthSeries,
  holdingAcross,
  isManuallyValued,
} from '@/lib/insights';
import type { Account } from '@/lib/models';
import { useWealth } from '@/lib/wealth-context';
import { Avatar, Change, Logo } from './primitives';

const shortDate = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** A small line chart with a faint area under it. */
export function MiniChart({
  values,
  height = 96,
  label,
}: {
  values: number[];
  height?: number;
  label: string;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const y = (v: number) =>
    max === min
      ? height / 2
      : height - 6 - ((v - min) / (max - min)) * (height - 12);
  const step = 300 / (values.length - 1);
  const line = values.map(
    (v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`,
  );
  const up = values[values.length - 1] >= values[0];
  return (
    <figure className="mini-chart-wrap">
      <figcaption className="sr-only">{label}</figcaption>
      <svg
        className={`mini-chart ${up ? 'up' : 'down'}`}
        viewBox={`0 0 300 ${height}`}
        preserveAspectRatio="none"
        style={{ height }}
        aria-hidden="true"
      >
        <polygon
          className="area"
          points={`0,${height} ${line.join(' ')} 300,${height}`}
        />
        <polyline className="line" points={line.join(' ')} fill="none" />
      </svg>
    </figure>
  );
}

/** Value history for manually valued accounts, with a form to record a new value. */
export function ValueHistory({ account }: { account: Account }) {
  const w = useWealth();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const history = w.valueHistory(account);
  const debt = account.value < 0;
  const native = (v: number) =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: account.currency,
      maximumFractionDigits: 0,
    }).format(Math.abs(v) * fx[account.currency]);
  function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Number(new FormData(e.currentTarget).get('value'));
    if (!Number.isFinite(raw) || raw <= 0) {
      setError(
        `Enter the ${debt ? 'amount owed' : 'current value'}, above zero.`,
      );
      return;
    }
    const eur = raw / fx[account.currency];
    w.updateValue(account.id, debt ? -eur : eur);
    setError('');
    setEditing(false);
  }
  return (
    <section className="panel value-history">
      <div className="panel-title">
        <h2>Value history</h2>
        {!editing && (
          <button className="button small" onClick={() => setEditing(true)}>
            <PencilLine size={15} />
            Update value
          </button>
        )}
      </div>
      {editing && (
        <form className="value-form" onSubmit={save}>
          <label className="field-label" htmlFor={`value-${account.id}`}>
            {debt ? 'Amount owed today' : 'Value today'} ({account.currency})
            <input
              id={`value-${account.id}`}
              name="value"
              type="number"
              min="0.01"
              step="0.01"
              placeholder={String(
                Math.round(Math.abs(account.value) * fx[account.currency]),
              )}
              required
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="value-form-actions">
            <button className="button primary small" type="submit">
              Save value
            </button>
            <button
              className="button small"
              type="button"
              onClick={() => {
                setEditing(false);
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <MiniChart
        values={history.map((h) => h.value)}
        height={80}
        label={`${account.name} value over time`}
      />
      <ol className="history-list">
        {[...history].reverse().map((h, i, list) => {
          const prev = list[i + 1];
          const diff = prev ? h.value - prev.value : 0;
          return (
            <li key={`${h.date}-${i}`}>
              <span>{shortDate(h.date)}</span>
              <span className="history-value">
                <strong>
                  {h.value < 0 ? '−' : ''}
                  {w.money(Math.abs(h.value))}
                </strong>
                <small>
                  {native(h.value)}
                  {prev && diff !== 0 && (
                    <span className={diff > 0 ? 'up' : 'down'}>
                      {' · '}
                      {diff > 0 ? '+' : '−'}
                      {w.money(Math.abs(diff))}
                    </span>
                  )}
                </small>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** "Held across N accounts", expanding to the value held in each account. */
export function HeldAcross({ ticker }: { ticker: string }) {
  const w = useWealth();
  const [open, setOpen] = useState(false);
  const rows = holdingAcross(ticker, w.accounts);
  if (rows.length < 2) return null;
  const total = sum(rows);
  return (
    <div className="held-across">
      <button
        className="held-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Held across {rows.length} accounts
        <ChevronDown size={14} />
      </button>
      {open && (
        <ul>
          {rows.map((r) => (
            <li key={r.account.id}>
              <Avatar owner={r.account.owner} />
              <span className="held-name">
                {r.account.name}
                <small>
                  {
                    institutions.find((i) => i.id === r.account.institutionId)
                      ?.name
                  }
                </small>
              </span>
              <span className="held-value">
                {w.money(r.value)}
                <small>{Math.round((r.value / total) * 100)}%</small>
              </span>
            </li>
          ))}
          <li className="held-total">
            <span>Total held</span>
            <strong>{w.money(total)}</strong>
          </li>
        </ul>
      )}
    </div>
  );
}

/** Coloured bar showing how an account splits across its holdings and cash. */
export function AllocationStack({ account }: { account: Account }) {
  const holdings = holdingsFor(account);
  if (!holdings.length) return null;
  const colors = Object.values(assetColors);
  const parts = [
    ...holdings.map((h, i) => ({
      label: h.ticker,
      value: h.quantity * h.price,
      color: colors[i],
    })),
    { label: 'Cash', value: account.cash || 0, color: '#e3dfd3' },
  ].filter((p) => p.value > 0);
  return (
    <>
      <div className="holding-stack" aria-hidden="true">
        {parts.map((p) => (
          <span
            key={p.label}
            style={{
              flex: p.value,
              background: p.color,
            }}
          />
        ))}
      </div>
      <div className="holding-legend">
        {parts.map((p) => (
          <span key={p.label}>
            <i style={{ background: p.color }} />
            {p.label}{' '}
            <strong>{((p.value / account.value) * 100).toFixed(1)}%</strong>
          </span>
        ))}
      </div>
    </>
  );
}

function PanelBody({ account }: { account: Account }) {
  const w = useWealth();
  const institution = institutions.find((i) => i.id === account.institutionId)!;
  const holdings = holdingsFor(account);
  const manual = isManuallyValued(account);
  return (
    <div className="sheet-body">
      <div className="sheet-head">
        <Logo institution={institution} />
        <div>
          <span className="sheet-kicker">
            {account.owner} · {institution.name}
          </span>
          <strong className="sheet-balance">
            {account.value < 0 ? '−' : ''}
            {w.money(Math.abs(account.value))}
          </strong>
          {account.change !== 0 && (
            <Change value={account.change} label="this month" />
          )}
        </div>
      </div>
      {manual ? (
        <ValueHistory account={account} />
      ) : (
        <section className="panel">
          <div className="panel-title">
            <h2>Past month</h2>
          </div>
          <MiniChart
            values={accountMonthSeries([account])}
            label={`${account.name} balance over the past month`}
          />
        </section>
      )}
      {holdings.length > 0 && (
        <section className="panel">
          <div className="panel-title">
            <h2>Allocation</h2>
          </div>
          <AllocationStack account={account} />
        </section>
      )}
      {holdings.length > 0 && (
        <section className="panel">
          <div className="panel-title">
            <h2>Holdings</h2>
            <span className="panel-aside">{holdings.length}</span>
          </div>
          <ul className="sheet-holdings">
            {holdings.map((h) => (
              <li key={h.ticker}>
                <div className="sheet-holding-row">
                  <span className="holding-symbol">{h.ticker[0]}</span>
                  <span className="sheet-holding-name">
                    <strong>{h.name}</strong>
                    <small>
                      {h.ticker} · {h.quantity.toFixed(2)} shares
                    </small>
                  </span>
                  <span className="sheet-holding-value">
                    <strong>{w.money(h.quantity * h.price)}</strong>
                    <Change
                      value={((h.quantity * h.price) / h.cost - 1) * 100}
                      label="on cost"
                    />
                  </span>
                </div>
                <HeldAcross ticker={h.ticker} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <dl className="details-list sheet-details">
        <div>
          <dt>Type</dt>
          <dd>{account.type}</dd>
        </div>
        <div>
          <dt>Currency</dt>
          <dd>{account.currency}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{account.country}</dd>
        </div>
      </dl>
      <Link
        href={`/accounts/${account.id}`}
        className="button dark full"
        onClick={() => w.setPanel(null)}
      >
        Open full page
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

/** Account detail in a side panel (a bottom sheet on phones). */
export function AccountPanel() {
  const w = useWealth();
  const mobile = useIsMobile();
  const panel = w.panel;
  const accounts = (panel?.ids ?? [])
    .map((id) => w.accounts.find((a) => a.id === id))
    .filter((a): a is Account => !!a);
  const active =
    accounts.find((a) => a.id === panel?.active) ?? accounts[0] ?? null;
  return (
    <Sheet open={!!panel} onOpenChange={(o) => !o && w.setPanel(null)}>
      <SheetContent
        side={mobile ? 'bottom' : 'right'}
        className="account-sheet"
      >
        {active && (
          <>
            <SheetTitle className="sheet-title">{active.name}</SheetTitle>
            <SheetDescription className="sr-only">
              Account details for {active.name}
            </SheetDescription>
            {accounts.length > 1 && (
              <div
                className="sheet-tabs"
                aria-label="Accounts at this institution"
              >
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    aria-pressed={a.id === active.id}
                    className={a.id === active.id ? 'selected' : ''}
                    onClick={() =>
                      w.setPanel({ ids: panel!.ids, active: a.id })
                    }
                  >
                    {a.name}
                    <small>{a.owner}</small>
                  </button>
                ))}
              </div>
            )}
            <PanelBody key={active.id} account={active} />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
