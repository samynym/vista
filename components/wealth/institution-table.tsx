'use client';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { institutions, ownerColors, sum } from '@/lib/mock-data';
import { useWealth } from '@/lib/wealth-context';
import { Change, Logo } from './primitives';
export function InstitutionTable({ compact = false }: { compact?: boolean }) {
  const w = useWealth();
  const rows = institutions.filter(
    (i) =>
      i.id !== 'manual' && w.filtered.some((a) => a.institutionId === i.id),
  );
  return (
    <section className="institution-panel">
      <div className="institution-heading">
        <div>
          <h2>
            {compact ? 'Institutions' : 'All institutions'}{' '}
            <span className="count">{rows.length}</span>
          </h2>
          <p className="muted">
            Balance, monthly change and sync status for each.
          </p>
        </div>
        {compact && (
          <Link href="/institutions" className="text-link">
            View all institutions <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {[
              'Institution',
              'Ownership',
              'Balance',
              'This month',
              'Status',
              '',
            ].map((h, i) => (
              <TableHead
                key={i}
                className={i === 2 || i === 3 ? 'numeric' : ''}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {(compact ? rows.slice(0, 5) : rows).map((i) => {
            const ac = w.filtered.filter((a) => a.institutionId === i.id);
            const value = sum(ac);
            const connections = w.connections.filter(
              (c) =>
                c.institutionId === i.id &&
                (w.owner === 'Household' || c.owner === w.owner),
            );
            const attention = connections.some(
              (c) => c.status === 'Needs attention',
            );
            const disconnected = connections.every(
              (c) => c.status === 'Disconnected',
            );
            const change =
              ac.reduce((n, a) => n + a.value * a.change, 0) / value;
            return (
              <TableRow key={i.id}>
                <TableCell>
                  <Link
                    className="institution-name"
                    href={`/institutions/${i.id}`}
                  >
                    <Logo institution={i} />
                    <span>
                      <strong>{i.name}</strong>
                      <small>
                        {ac.length} {ac.length === 1 ? 'account' : 'accounts'}
                      </small>
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="owner-pills">
                    {[...new Set(ac.map((a) => a.owner))].map((o) => (
                      <span key={o}>
                        <i
                          style={{
                            background: ownerColors[o],
                          }}
                        />
                        {o}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="numeric balance">
                  {w.money(value)}
                </TableCell>
                <TableCell className="numeric">
                  <Change value={change} />
                </TableCell>
                <TableCell>
                  <div
                    className={`sync-status ${attention ? 'attention' : ''}`}
                  >
                    <i className="status-dot" />
                    {attention
                      ? 'Needs attention'
                      : disconnected
                        ? 'Disconnected'
                        : i.method === 'Import'
                          ? 'Imported'
                          : 'Connected'}
                    <small>
                      {disconnected
                        ? 'Saved balances'
                        : attention
                          ? 'Last synced 2 days ago'
                          : i.method === 'Import'
                            ? '2 days ago'
                            : 'Synced 4 min ago'}
                    </small>
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    className="button small soft"
                    aria-haspopup="dialog"
                    onClick={() => w.openAccounts(ac.map((a) => a.id))}
                  >
                    {ac.length === 1 ? 'View account' : 'View accounts'}
                    <ChevronRight size={15} />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
