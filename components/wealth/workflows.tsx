'use client';
import { useState, type SubmitEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  Link2,
  PencilLine,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { institutions, fx } from '@/lib/mock-data';
import type { AssetType, Currency, Institution, Owner } from '@/lib/models';
import { useWealth } from '@/lib/wealth-context';
import { Logo, Picker } from './primitives';
import { members, owners } from '@/lib/household';
const assetTypeMap: Record<string, AssetType> = {
  Property: 'Property',
  'Private company equity': 'Private equity',
  Cash: 'Cash',
  Investment: 'Public equities',
  Pension: 'Pension / retirement',
  Crypto: 'Crypto',
  Other: 'Other',
  'Loan / debt': 'Debt',
};
export function AddFlow({
  open,
  onClose,
  manual = false,
}: {
  open: boolean;
  onClose: () => void;
  manual?: boolean;
}) {
  const w = useWealth();
  const [step, setStep] = useState<'browse' | 'connect' | 'manual' | 'done'>(
    manual ? 'manual' : 'browse',
  );
  const [chosen, setChosen] = useState<Institution | null>(null);
  const [owner, setOwner] = useState<Owner>(
    w.owner === 'Household' ? members[0] : w.owner,
  );
  const [type, setType] = useState('Property');
  const [currency, setCurrency] = useState('EUR');
  const [country, setCountry] = useState('South Africa');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const close = () => {
    onClose();
    setTimeout(() => {
      setStep(manual ? 'manual' : 'browse');
      setError('');
      setQuery('');
    }, 200);
  };
  const connect = () => {
    if (!chosen) return;
    const exists = w.connections.some(
      (c) =>
        c.institutionId === chosen.id &&
        c.owner === owner &&
        c.status !== 'Disconnected',
    );
    if (exists) {
      setError(
        `${chosen.name} is already linked for ${owner}. You can manage it in Connections.`,
      );
      return;
    }
    w.setConnections((cs) => [
      ...cs.filter(
        (c) => !(c.institutionId === chosen.id && c.owner === owner),
      ),
      {
        id: `${chosen.id}-${owner}`,
        institutionId: chosen.id,
        owner,
        status: chosen.method === 'Import' ? 'Imported' : 'Connected',
        lastSynced: 'Just now',
      },
    ]);
    setDone(
      `${chosen.name} is linked for ${owner}. This demo connection has no account balances yet.`,
    );
    setStep('done');
  };
  function save(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const value = Number(f.get('value'));
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a current value greater than zero.');
      return;
    }
    w.addAsset({
      id: `manual-${Date.now()}`,
      institutionId: 'manual',
      owner,
      name: (f.get('name') as string).trim(),
      value:
        (type === 'Loan / debt' ? -value : value) / fx[currency as Currency],
      currency: currency as Currency,
      country,
      type: assetTypeMap[type],
      change: 0,
      purchaseValue: f.get('purchase')
        ? Number(f.get('purchase')) / fx[currency as Currency]
        : undefined,
      acquisitionDate: (f.get('date') as string) || '',
      notes: (f.get('notes') as string) || '',
    });
    setDone(
      `${f.get('name') as string} has been added to ${owner}’s assets. Your totals have been updated.`,
    );
    setStep('done');
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="wealth-modal">
        <DialogTitle className="modal-title">
          {step === 'done'
            ? 'You’re all set'
            : step === 'manual'
              ? 'Add an asset'
              : step === 'connect'
                ? `Connect ${chosen?.name}`
                : 'Add an account'}
        </DialogTitle>
        <DialogDescription>
          {step === 'manual'
            ? 'Add an asset you track yourself.'
            : step === 'done'
              ? done
              : step === 'connect'
                ? 'A preview of the connection experience.'
                : 'Connect an institution, import a statement, or add an asset.'}
        </DialogDescription>
        {step === 'browse' && (
          <>
            <div className="modal-search">
              <Search size={16} />
              <input
                aria-label="Search institutions"
                placeholder="Search institutions"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="institution-catalog">
              {['Banks', 'Investments', 'Crypto', 'Pensions', 'Other'].map(
                (category) => {
                  const items = institutions.filter(
                    (i) =>
                      i.category === category &&
                      i.id !== 'manual' &&
                      i.name.toLowerCase().includes(query.toLowerCase()),
                  );
                  return (
                    <div key={category}>
                      {(items.length > 0 || category === 'Other') && (
                        <h3>{category}</h3>
                      )}
                      {items.map((i) => (
                        <button
                          key={i.id}
                          className="catalog-item"
                          onClick={() => {
                            setChosen(i);
                            setError('');
                            setStep('connect');
                          }}
                        >
                          <Logo institution={i} />
                          <strong>{i.name}</strong>
                          <span className="method">
                            {i.method === 'Import' ? (
                              <Upload size={12} />
                            ) : (
                              <Link2 size={12} />
                            )}{' '}
                            {i.method === 'Experimental'
                              ? 'Automatic · experimental'
                              : i.method}
                          </span>
                          <ArrowRight size={14} />
                        </button>
                      ))}
                      {category === 'Other' &&
                        [
                          'Other asset',
                          'Private company equity',
                          'Property',
                          'Loan / debt',
                        ]
                          .filter((n) =>
                            n.toLowerCase().includes(query.toLowerCase()),
                          )
                          .map((n) => (
                            <button
                              key={n}
                              className="catalog-item"
                              onClick={() => {
                                setType(n === 'Other asset' ? 'Other' : n);
                                setStep('manual');
                              }}
                            >
                              <span className="institution-logo">
                                <PencilLine size={18} />
                              </span>
                              <strong>{n}</strong>
                              <span className="method">Manual</span>
                              <ArrowRight size={14} />
                            </button>
                          ))}
                    </div>
                  );
                },
              )}
            </div>
            <div className="modal-note">
              <ShieldCheck size={15} />
              Demo only. No real accounts will be connected.
            </div>
          </>
        )}
        {step === 'connect' && (
          <>
            <button
              className="back-link"
              onClick={() => {
                setStep('browse');
                setError('');
              }}
            >
              <ArrowLeft size={14} />
              All institutions
            </button>
            <div className="connect-preview">
              {chosen && <Logo institution={chosen} />}
              <h3>{chosen?.name}</h3>
              <p>
                {chosen?.method === 'Import'
                  ? 'In the full app, you’ll import a statement to update your balances.'
                  : 'In the full app, you’ll authorize a secure, read-only connection.'}
              </p>
              <span className="method">
                {chosen?.method === 'Experimental'
                  ? 'Automatic · experimental'
                  : chosen?.method}
              </span>
            </div>
            <div className="field-label">
              Account owner
              <Picker
                label="Connection owner"
                value={owner}
                onChange={(v) => setOwner(v as Owner)}
                options={[...owners]}
              />
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button className="button primary full" onClick={connect}>
              {chosen?.method === 'Import'
                ? 'Simulate statement import'
                : 'Create demo connection'}
              <ArrowRight size={15} />
            </button>
            <p className="small muted">
              No credentials, files, or external services are required.
            </p>
          </>
        )}
        {step === 'manual' && (
          <form onSubmit={save} className="asset-form">
            <div className="form-grid">
              <div className="field-label">
                Owner
                <Picker
                  label="Asset owner"
                  value={owner}
                  onChange={(v) => setOwner(v as Owner)}
                  options={[...owners]}
                />
              </div>
              <div className="field-label">
                Asset type
                <Picker
                  label="Asset type"
                  value={type}
                  onChange={setType}
                  options={Object.keys(assetTypeMap)}
                />
              </div>
            </div>
            <label className="field-label">
              Name
              <input
                name="name"
                placeholder="e.g. Cape Town apartment"
                required
                maxLength={80}
              />
            </label>
            <div className="form-grid">
              <label className="field-label">
                Current value
                <input
                  name="value"
                  placeholder="0.00"
                  type="number"
                  min="0.01"
                  max="10000000000"
                  step="0.01"
                  required
                />
              </label>
              <div className="field-label">
                Currency
                <Picker
                  label="Asset currency"
                  value={currency}
                  onChange={setCurrency}
                  options={['EUR', 'USD', 'ZAR', 'GBP', 'CHF']}
                />
              </div>
            </div>
            <div className="field-label">
              Country / custodian location
              <Picker
                label="Asset country"
                value={country}
                onChange={setCountry}
                options={[
                  'South Africa',
                  'France',
                  'United States',
                  'Germany',
                  'Other',
                ]}
              />
            </div>
            <details>
              <summary>Optional details</summary>
              <div className="form-grid">
                <label className="field-label">
                  Purchase value
                  <input name="purchase" type="number" min="0" step="0.01" />
                </label>
                <label className="field-label">
                  Acquisition date
                  <input name="date" type="date" max="2026-09-07" />
                </label>
              </div>
              <label className="field-label">
                Notes
                <textarea name="notes" rows={2} maxLength={500} />
              </label>
            </details>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="modal-note">
              Assets are kept for this session. Refreshing restores the demo.
            </div>
            <button className="button primary full" type="submit">
              <Plus size={16} />
              Add asset
            </button>
          </form>
        )}
        {step === 'done' && (
          <>
            <div className="success-icon">
              <Check size={28} />
            </div>
            <button className="button primary full" onClick={close}>
              Done
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
