'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartPie,
  Landmark,
  Layers,
  LayoutDashboard,
  Plus,
  Settings,
  Unplug,
} from 'lucide-react';
import { WealthProvider, useWealth } from '@/lib/wealth-context';
import { OwnerToggle, Picker } from './primitives';
import type { Currency } from '@/lib/models';
import { AddFlow } from './workflows';
import { AccountPanel } from './account-view';
import { members, memberClass } from '@/lib/household';
const nav = [
  ['Overview', '/', LayoutDashboard],
  ['Portfolio', '/portfolio', ChartPie],
  ['Institutions', '/institutions', Landmark],
  ['Connections', '/connections', Unplug],
  ['Assets', '/assets', Layers],
] as const;
const pages: Record<string, [string, string]> = {
  '/portfolio': [
    'Portfolio',
    'How your money is invested, by type, country and currency.',
  ],
  '/institutions': [
    'Institutions',
    'Every bank, broker and pension provider you track.',
  ],
  '/connections': [
    'Connections',
    'Vista only reads balances. It can never move money.',
  ],
  '/assets': ['Assets', 'Every account and asset you own, and what you owe.'],
  '/settings': ['Settings', 'Your household, base currency and demo data.'],
};
function ShellContent({ children }: { children: React.ReactNode }) {
  const w = useWealth();
  const path = usePathname();
  const [add, setAdd] = useState(false);
  const page = pages[path];
  const attention = w.connections.some((c) => c.status === 'Needs attention');
  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href);
  return (
    <div className="app">
      <header className="topnav">
        <Link href="/" className="brand" aria-label="Vista home">
          <span className="brand-mark">v</span>vista
        </Link>
        <nav className="nav-pills" aria-label="Main">
          {nav.map(([name, href]) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={active ? 'active' : ''}
                aria-current={active ? 'page' : undefined}
              >
                {name}
                {name === 'Connections' && attention && (
                  <span className="nav-alert" aria-label="needs attention" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="topnav-right">
          <Picker
            label="Base currency"
            value={w.currency}
            onChange={(v) => w.setCurrency(v as Currency)}
            options={['EUR', 'USD', 'ZAR', 'GBP']}
            className="pill-picker"
          />
          <Link
            href="/settings"
            className={`icon-pill ${path === '/settings' ? 'active' : ''}`}
            aria-label="Settings"
          >
            <Settings size={18} />
          </Link>
          <span className="avatar-pair" aria-label={members.join(' and ')}>
            {members.map((m) => (
              <span key={m} className={`avatar ${memberClass(m)}`}>
                {m[0]}
              </span>
            ))}
          </span>
        </div>
      </header>
      <main className="page">
        {page && (
          <div className="page-head">
            <div>
              <h1>{page[0]}</h1>
              <p>{page[1]}</p>
            </div>
            <div className="page-actions">
              <OwnerToggle />
              <button className="button primary" onClick={() => setAdd(true)}>
                <Plus size={16} />
                Add account
              </button>
            </div>
          </div>
        )}
        {children}
        <footer className="page-footer">
          Prototype. All values are illustrative.
        </footer>
      </main>
      <nav className="tabbar" aria-label="Main">
        {nav.map(([name, href, Icon]) => (
          <Link
            key={href}
            href={href}
            className={isActive(href) ? 'active' : ''}
            aria-current={isActive(href) ? 'page' : undefined}
          >
            <span className="tab-icon">
              <Icon size={20} />
              {name === 'Connections' && attention && (
                <span className="nav-alert" aria-label="needs attention" />
              )}
            </span>
            {name}
          </Link>
        ))}
      </nav>
      <AddFlow open={add} onClose={() => setAdd(false)} />
      <AccountPanel />
    </div>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <WealthProvider>
      <ShellContent>{children}</ShellContent>
    </WealthProvider>
  );
}
