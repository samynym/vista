'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Plus,
  Wallet,
  Globe2,
  RefreshCw,
  Unplug,
  Check,
  AlertCircle,
  Users,
  ShieldCheck,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Allocation, Exposure } from './charts';
import { HeldAcross, ValueHistory } from './account-view';
import { isManuallyValued } from '@/lib/insights';
import { AddFlow } from './workflows';
import { Avatar, Change, Logo, PanelTitle, Picker } from './primitives';
import { useWealth } from '@/lib/wealth-context';
import {
  assetColors,
  filterByOwner,
  fx,
  holdingsFor,
  institutions,
  sum,
} from '@/lib/mock-data';
import type { Account, Connection, Currency } from '@/lib/models';
import { members, owners } from '@/lib/household';
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <Wallet size={30} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button" href="/institutions">
        View institutions
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
export function InstitutionDetail() {
  const w = useWealth();
  const id = usePathname().split('/').pop();
  const institution = institutions.find((i) => i.id === id);
  if (!institution)
    return (
      <Empty
        title="Institution not found"
        text="Choose an institution from your balance sheet."
      />
    );
  const ac = w.filtered.filter((a) => a.institutionId === id);
  if (!ac.length)
    return (
      <Empty
        title={`No ${institution.name} accounts for ${w.owner}`}
        text="Switch to Household to see all owners, or explore your other institutions."
      />
    );
  const val = sum(ac);
  const cons = filterByOwner(w.connections, w.owner).filter(
    (c) => c.institutionId === id,
  );
  return (
    <>
      <Link href="/institutions" className="back-link">
        <ArrowLeft size={14} />
        All institutions
      </Link>
      <section className="detail-hero">
        <div className="detail-identity">
          <Logo institution={institution} />
          <div>
            <h2>{institution.name}</h2>
            <p>
              {plural(ac.length, 'account')} <span>·</span>{' '}
              {[...new Set(ac.map((a) => a.owner))].join(' & ')}
            </p>
          </div>
        </div>
        <div className="detail-total">
          <span>Total balance</span>
          <strong>{w.money(val)}</strong>
          <Change
            value={ac.reduce((n, a) => n + a.change * a.value, 0) / val}
            label="this month"
          />
        </div>
      </section>
      {institution.method !== 'Manual' && (
        <div className="subtle-banner">
          <ShieldCheck size={16} />
          <span>
            {cons.some((c) => c.status === 'Needs attention')
              ? 'One connection needs attention. Balances reflect the last successful sync.'
              : `Balances ${institution.method === 'Import' ? 'imported 2 days' : 'synced 4 minutes'} ago. Values shown in ${w.currency}.`}
          </span>
          <Link href="/connections">
            Manage connection
            <ArrowRight size={13} />
          </Link>
        </div>
      )}
      {owners
        .filter((o) => ac.some((a) => a.owner === o))
        .map((owner) => (
          <section className="owner-account-section" key={owner}>
            <div className="section-heading">
              <h2>
                <Avatar owner={owner} />
                {owner}
                <span className="count">
                  {plural(
                    ac.filter((a) => a.owner === owner).length,
                    'account',
                  )}
                </span>
              </h2>
              <strong>
                {w.money(sum(ac.filter((a) => a.owner === owner)))}
              </strong>
            </div>
            <div className="account-grid">
              {ac
                .filter((a) => a.owner === owner)
                .map((a) => (
                  <button
                    className="account-card"
                    key={a.id}
                    aria-haspopup="dialog"
                    onClick={() =>
                      w.openAccounts(
                        ac.map((x) => x.id),
                        a.id,
                      )
                    }
                  >
                    <div className="account-card-top">
                      <span className="account-currency">{a.currency}</span>
                      <ChevronRight size={16} />
                    </div>
                    <h3>{a.name}</h3>
                    <p>{a.type}</p>
                    <strong>{w.money(a.value)}</strong>
                    <div className="account-card-footer">
                      <Change value={a.change} label="this month" />
                      <span>{a.country}</span>
                    </div>
                  </button>
                ))}
            </div>
          </section>
        ))}
    </>
  );
}
export function AccountDetail() {
  const w = useWealth();
  const id = usePathname().split('/').pop();
  const account = w.filtered.find((a) => a.id === id);
  if (!account)
    return (
      <Empty
        title="This account isn’t in your current view"
        text="Switch owners to see this account, or return to your institutions."
      />
    );
  const institution = institutions.find((i) => i.id === account.institutionId)!;
  const holdings = holdingsFor(account);
  const invested = sum(holdings.map((h) => ({ value: h.quantity * h.price })));
  const cost = sum(holdings.map((h) => ({ value: h.cost })));
  return (
    <>
      <Link className="back-link" href={`/institutions/${institution.id}`}>
        <ArrowLeft size={14} />
        {institution.name}
        <ChevronRight size={12} />
        {account.owner}
      </Link>
      <section className="detail-hero">
        <div className="detail-identity">
          <Logo institution={institution} />
          <div>
            <div className="detail-kicker">
              {account.owner} · {institution.name}
            </div>
            <h2>{account.name}</h2>
            <p>
              {account.type} <span>·</span> {account.currency} <span>·</span>{' '}
              {account.country}
            </p>
          </div>
        </div>
        <div className="detail-total">
          <span>Account balance</span>
          <strong>{w.money(account.value)}</strong>
          <Change value={account.change} label="this month" />
        </div>
      </section>
      <div className="metric-grid">
        <div>
          <span>
            {holdings.length ? 'Total investment gain' : 'Monthly change'}
          </span>
          <strong>
            {w.money(
              holdings.length
                ? invested - cost
                : account.value - account.value / (1 + account.change / 100),
            )}
          </strong>
          <small>
            {holdings.length
              ? `+${(((invested - cost) / cost) * 100).toFixed(2)}% on cost basis`
              : 'Change in account valuation'}
          </small>
        </div>
        <div>
          <span>Cash balance</span>
          <strong>
            {w.money(
              account.type === 'Cash' ? account.value : account.cash || 0,
            )}
          </strong>
          <small>Included in account balance</small>
        </div>
        <div>
          <span>Native currency value</span>
          <strong>
            {new Intl.NumberFormat('en-IE', {
              style: 'currency',
              currency: account.currency,
              maximumFractionDigits: 0,
            }).format(account.value * fx[account.currency])}
          </strong>
          <small>Illustrative fixed FX rate</small>
        </div>
      </div>
      {isManuallyValued(account) && <ValueHistory account={account} />}
      {holdings.length > 0 ? (
        <>
          <section className="institution-panel holdings-panel">
            <div className="institution-heading">
              <div>
                <h2>
                  Holdings <span className="count">{holdings.length}</span>
                </h2>
                <p className="muted">
                  Market values and cost basis shown in {w.currency}.
                </p>
              </div>
              <span className="small muted">
                Illustrative prices, 7 Sep 2026
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    'Asset / ticker',
                    'Quantity',
                    'Current price',
                    'Market value',
                    'Cost basis',
                    'Gain / loss',
                    'Weight',
                  ].map((v, i) => (
                    <TableHead key={v} className={i ? 'numeric' : ''}>
                      {v}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((h) => (
                  <TableRow key={h.ticker}>
                    <TableCell>
                      <div className="holding-name">
                        <span className="holding-symbol">{h.ticker[0]}</span>
                        <span>
                          <strong>{h.name}</strong>
                          <small>{h.ticker}</small>
                          <HeldAcross ticker={h.ticker} />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="numeric">
                      {h.quantity.toFixed(4)}
                    </TableCell>
                    <TableCell className="numeric">
                      {w.money(h.price, 2)}
                    </TableCell>
                    <TableCell className="numeric balance">
                      {w.money(h.quantity * h.price, 2)}
                    </TableCell>
                    <TableCell className="numeric">
                      {w.money(h.cost, 2)}
                    </TableCell>
                    <TableCell className="numeric">
                      <span className="holding-gain">
                        +{w.money(h.quantity * h.price - h.cost, 2)}
                      </span>
                      <small className="cell-secondary">
                        +
                        {(((h.quantity * h.price) / h.cost - 1) * 100).toFixed(
                          2,
                        )}
                        %
                      </small>
                    </TableCell>
                    <TableCell className="numeric">
                      {(((h.quantity * h.price) / account.value) * 100).toFixed(
                        1,
                      )}
                      %
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="holdings-total">
              <span>
                Holdings {w.money(invested)} + cash {w.money(account.cash || 0)}
              </span>
              <strong>Total {w.money(account.value)}</strong>
            </div>
          </section>
          <section className="wide-panel account-allocation">
            <PanelTitle title="Account allocation" />
            <div className="holding-stack">
              {holdings.map((h, i) => (
                <span
                  key={h.ticker}
                  title={`${h.name}: ${(((h.quantity * h.price) / account.value) * 100).toFixed(1)}%`}
                  style={{
                    width: `${((h.quantity * h.price) / account.value) * 100}%`,
                    background: Object.values(assetColors)[i],
                  }}
                />
              ))}
              <span title="Cash" style={{ flex: 1, background: '#e3dfd3' }} />
            </div>
            <div className="holding-legend">
              {holdings.map((h, i) => (
                <span key={h.ticker}>
                  <i style={{ background: Object.values(assetColors)[i] }} />
                  {h.ticker}{' '}
                  <strong>
                    {(((h.quantity * h.price) / account.value) * 100).toFixed(
                      1,
                    )}
                    %
                  </strong>
                </span>
              ))}
              <span>
                <i style={{ background: '#e3dfd3' }} />
                Cash{' '}
                <strong>
                  {(((account.cash || 0) / account.value) * 100).toFixed(1)}%
                </strong>
              </span>
            </div>
          </section>
        </>
      ) : (
        <section className="wide-panel">
          <PanelTitle title="Account details" />
          <dl className="details-list">
            <div>
              <dt>Owner</dt>
              <dd>{account.owner}</dd>
            </div>
            <div>
              <dt>Asset class</dt>
              <dd>{account.type}</dd>
            </div>
            <div>
              <dt>Asset / custodian location</dt>
              <dd>{account.country}</dd>
            </div>
            <div>
              <dt>Account currency</dt>
              <dd>{account.currency}</dd>
            </div>
            <div>
              <dt>Valuation</dt>
              <dd>{w.money(account.value)}</dd>
            </div>
          </dl>
          <p className="muted">
            {account.type === 'Cash'
              ? 'This account is held entirely in cash.'
              : 'This asset is tracked by its total valuation; individual holdings are not included in this demo.'}
          </p>
        </section>
      )}
    </>
  );
}
export function Portfolio() {
  const w = useWealth();
  return (
    <>
      <div className="portfolio-summary">
        <div>
          <span>Portfolio value</span>
          <strong>{w.money(w.total)}</strong>
        </div>
        <div>
          <span>Accounts and assets</span>
          <strong>{w.filtered.length}</strong>
        </div>
        <div>
          <span>Currencies</span>
          <strong>{new Set(w.filtered.map((a) => a.currency)).size}</strong>
        </div>
      </div>
      <div className="analysis-grid">
        <Allocation />
        <Exposure kind="geography" />
        <Exposure kind="currency" />
      </div>
      <AssetTable
        title="Investment accounts"
        accounts={w.filtered.filter(
          (a) =>
            a.type === 'Public equities' ||
            a.type === 'Private equity' ||
            a.type === 'Pension / retirement' ||
            a.type === 'Crypto',
        )}
      />
    </>
  );
}
function AssetTable({
  title,
  accounts,
}: {
  title: string;
  accounts: Account[];
}) {
  const w = useWealth();
  return (
    <section className="institution-panel">
      <div className="institution-heading">
        <h2>
          {title}
          <span className="count">{accounts.length}</span>
        </h2>
        <strong>{w.money(sum(accounts))}</strong>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {[
              'Asset / account',
              'Owner',
              'Asset class',
              'Currency',
              'Location',
              'Value',
              '',
            ].map((s, i) => (
              <TableHead key={i} className={i === 5 ? 'numeric' : ''}>
                {s}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <Link className="institution-name" href={`/accounts/${a.id}`}>
                  <Logo
                    institution={institutions.find(
                      (i) => i.id === a.institutionId,
                    )!}
                  />
                  <span>
                    <strong>{a.name}</strong>
                    <small>
                      {institutions.find((i) => i.id === a.institutionId)?.name}
                    </small>
                  </span>
                </Link>
              </TableCell>
              <TableCell>{a.owner}</TableCell>
              <TableCell>
                <span className="asset-type">
                  <i style={{ background: assetColors[a.type] }} />
                  {a.type}
                </span>
              </TableCell>
              <TableCell>{a.currency}</TableCell>
              <TableCell>{a.country}</TableCell>
              <TableCell className="numeric balance">
                {w.money(a.value)}
              </TableCell>
              <TableCell>
                <Link
                  className="arrow-link"
                  aria-label={`View ${a.name} for ${a.owner}`}
                  href={`/accounts/${a.id}`}
                >
                  <ChevronRight size={15} />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!accounts.length && (
        <p className="table-empty">No assets match this view.</p>
      )}
    </section>
  );
}
export function Assets() {
  const w = useWealth();
  const [add, setAdd] = useState(false);
  const [filter, setFilter] = useState('All asset types');
  const data = w.filtered.filter(
    (a) => filter === 'All asset types' || a.type === filter,
  );
  return (
    <>
      <div className="assets-toolbar">
        <div>
          <Picker
            value={filter}
            label="Filter asset class"
            onChange={setFilter}
            options={['All asset types', ...Object.keys(assetColors)]}
          />
          <span className="muted small">{data.length} accounts & assets</span>
        </div>
        <button className="button" onClick={() => setAdd(true)}>
          <Plus size={15} />
          Add manual asset
        </button>
      </div>
      <AssetTable title="Balance sheet" accounts={data} />
      <AddFlow open={add} onClose={() => setAdd(false)} manual />
    </>
  );
}
export function Connections() {
  const w = useWealth();
  const [selected, setSelected] = useState<Connection | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const connections = filterByOwner(w.connections, w.owner);
  const live = selected
    ? w.connections.find((c) => c.id === selected.id)
    : null;
  function update(status: Connection['status']) {
    if (!selected) return;
    setBusy(true);
    setTimeout(() => {
      w.updateConnection(selected.id, status);
      setMessage(
        status === 'Disconnected'
          ? 'Disconnected. Existing balances remain in your household.'
          : 'Demo sync complete. Your saved balances are up to date.',
      );
      setBusy(false);
    }, 600);
  }
  return (
    <>
      <div className="connection-summary">
        <div>
          <span className="status-dot" />
          <strong>
            {
              connections.filter(
                (c) => c.status === 'Connected' || c.status === 'Imported',
              ).length
            }
          </strong>{' '}
          healthy connections
        </div>
        <div>
          <span className="status-dot amber" />
          <strong>
            {connections.filter((c) => c.status === 'Needs attention').length}
          </strong>{' '}
          need attention
        </div>
        <span>Read-only access. No money can move.</span>
      </div>
      {owners
        .filter((o) => connections.some((c) => c.owner === o))
        .map((o) => (
          <section className="connection-group" key={o}>
            <div className="section-heading">
              <h2>
                <Avatar owner={o} />
                {o}
                <span className="count">
                  {plural(
                    connections.filter((c) => c.owner === o).length,
                    'connection',
                  )}
                </span>
              </h2>
            </div>
            <div className="connection-grid">
              {connections
                .filter((c) => c.owner === o)
                .map((c) => {
                  const i = institutions.find((i) => i.id === c.institutionId)!;
                  return (
                    <button
                      className={`connection-card ${c.status === 'Needs attention' ? 'needs-attention' : ''}`}
                      key={c.id}
                      onClick={() => {
                        setSelected(c);
                        setMessage('');
                      }}
                    >
                      <div className="connection-top">
                        <Logo institution={i} />
                        <span className="method">
                          {i.method === 'Experimental'
                            ? 'Automatic · experimental'
                            : i.method}
                        </span>
                        <ChevronRight size={14} />
                      </div>
                      <h3>{i.name}</h3>
                      <div
                        className={`sync-status ${c.status === 'Needs attention' ? 'attention' : ''}`}
                      >
                        <i className="status-dot" />
                        {c.status}
                      </div>
                      <div className="connection-foot">
                        <span>
                          {c.status === 'Imported' ? 'Imported' : 'Last synced'}{' '}
                          {c.lastSynced}
                        </span>
                        <span>
                          {plural(
                            w.accounts.filter(
                              (a) => a.owner === o && a.institutionId === i.id,
                            ).length,
                            'account',
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>
        ))}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="wealth-modal">
          <DialogTitle className="modal-title">
            {institutions.find((i) => i.id === selected?.institutionId)?.name}
          </DialogTitle>
          <DialogDescription>
            {selected?.owner}’s connection · {live?.status}
          </DialogDescription>
          <div className="modal-note">
            <ShieldCheck size={16} />
            Demo connection. No financial provider is contacted.
          </div>
          {live?.status === 'Needs attention' && (
            <div className="warning-box">
              <AlertCircle size={18} />
              <span>
                The demo authorization has expired. Reconnect to resume updates.
              </span>
            </div>
          )}
          {message && (
            <output className="success-message">
              <Check size={16} />
              {message}
            </output>
          )}
          <button
            disabled={busy}
            className="button primary full"
            onClick={() =>
              update(
                institutions.find((i) => i.id === selected?.institutionId)
                  ?.method === 'Import'
                  ? 'Imported'
                  : 'Connected',
              )
            }
          >
            <RefreshCw className={busy ? 'spinning' : ''} size={16} />
            {busy
              ? 'Updating…'
              : live?.status === 'Needs attention' ||
                  live?.status === 'Disconnected'
                ? 'Reconnect demo'
                : live?.status === 'Imported'
                  ? 'Simulate updated import'
                  : 'Sync now'}
          </button>
          {live?.status !== 'Disconnected' && (
            <button
              disabled={busy}
              className="button full"
              onClick={() => update('Disconnected')}
            >
              <Unplug size={15} />
              Disconnect
            </button>
          )}
          <button className="text-link" onClick={() => setSelected(null)}>
            Close
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function Settings() {
  const w = useWealth();
  return (
    <div className="settings-page">
      <section className="wide-panel">
        <PanelTitle title="Household" />
        <div className="settings-row">
          <div>
            <strong>Our household</strong>
            <p>
              One workspace for {members.join(', ')}, and your shared assets.
            </p>
          </div>
          <Users size={21} />
        </div>
        <div className="settings-row">
          <div>
            <strong>Base currency</strong>
            <p>Used for totals, charts, and converted asset values.</p>
          </div>
          <Picker
            label="Settings base currency"
            value={w.currency}
            onChange={(v) => w.setCurrency(v as Currency)}
            options={['EUR', 'USD', 'ZAR', 'GBP']}
          />
        </div>
        <div className="settings-row">
          <div>
            <strong>Household owners</strong>
            <p>Ownership is separate from access to this workspace.</p>
          </div>
          <div className="owner-pills">
            {owners.map((o) => (
              <span key={o}>{o}</span>
            ))}
          </div>
        </div>
        <div className="settings-row">
          <div>
            <strong>Workspace access</strong>
            <p>{members[0]} · Household administrator</p>
          </div>
          <ShieldCheck size={20} />
        </div>
      </section>
      <section className="wide-panel">
        <PanelTitle title="About this prototype" />
        <p className="settings-description">
          All accounts, holdings, valuations, and exchange rates are
          illustrative. Changes last for your current session. Refresh the page
          to restore the original household data.
        </p>
        <div className="settings-row">
          <div>
            <strong>Valuation date</strong>
            <p>7 September 2026</p>
          </div>
          <Globe2 size={20} />
        </div>
      </section>
    </div>
  );
}
