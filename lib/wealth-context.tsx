'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  Account,
  Asset,
  Connection,
  Currency,
  OwnerFilter,
} from './models';
import { baseValueHistory, type ValueEntry } from './insights';
import {
  initialAccounts,
  initialConnections,
  filterByOwner,
  fx,
  sum,
} from './mock-data';
function useWealthState() {
  const [owner, setOwner] = useState<OwnerFilter>('Household');
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [connections, setConnections] =
    useState<Connection[]>(initialConnections);
  const filtered = filterByOwner(accounts, owner);
  const money = (value: number, decimals = 0) =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(value * fx[currency]);
  const [valueLog, setValueLog] = useState<Record<string, ValueEntry[]>>({});
  const [panel, setPanel] = useState<{ ids: string[]; active: string } | null>(
    null,
  );
  const addAsset = (asset: Asset) => setAccounts((a) => [...a, asset]);
  const valueHistory = (a: Account) => valueLog[a.id] ?? baseValueHistory(a);
  /** Records a new value (in EUR) for a manually valued account. */
  const updateValue = (id: string, value: number) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    setValueLog((log) => ({
      ...log,
      [id]: [
        ...(log[id] ?? baseValueHistory(account)),
        { date: new Date().toISOString().slice(0, 10), value },
      ],
    }));
    setAccounts((as) => as.map((a) => (a.id === id ? { ...a, value } : a)));
  };
  const openAccounts = (ids: string[], active = ids[0]) =>
    ids.length && setPanel({ ids, active });
  const updateConnection = (id: string, status: Connection['status']) =>
    setConnections((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              lastSynced: status === 'Disconnected' ? c.lastSynced : 'Just now',
            }
          : c,
      ),
    );
  return {
    owner,
    setOwner,
    currency,
    setCurrency,
    accounts,
    filtered,
    connections,
    setConnections,
    money,
    total: sum(filtered),
    addAsset,
    updateConnection,
    valueHistory,
    updateValue,
    panel,
    setPanel,
    openAccounts,
  };
}
const WealthContext = createContext<ReturnType<typeof useWealthState> | null>(
  null,
);
export function WealthProvider({ children }: { children: ReactNode }) {
  const state = useWealthState();
  return (
    <WealthContext.Provider value={state}>{children}</WealthContext.Provider>
  );
}
export function useWealth() {
  const c = useContext(WealthContext);
  if (!c) throw new Error('Missing WealthProvider');
  return c;
}
