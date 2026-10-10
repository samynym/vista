import type { Member } from './household';
export type Owner = Member | 'Joint';
export type OwnerFilter = 'Household' | Member;
export type Currency = 'EUR' | 'USD' | 'ZAR' | 'GBP' | 'CHF';
export type AssetType =
  | 'Public equities'
  | 'Cash'
  | 'Private equity'
  | 'Crypto'
  | 'Pension / retirement'
  | 'Property'
  | 'Debt'
  | 'Other';
export interface Household {
  id: string;
  name: string;
  owners: Owner[];
  baseCurrency: Currency;
}
export interface Institution {
  id: string;
  name: string;
  short: string;
  color: string;
  category: 'Banks' | 'Investments' | 'Crypto' | 'Pensions' | 'Other';
  method: 'Automatic' | 'Experimental' | 'Import' | 'Manual';
}
export interface Account {
  id: string;
  institutionId: string;
  owner: Owner;
  name: string;
  value: number;
  currency: Currency;
  country: string;
  type: AssetType;
  change: number;
  cash?: number;
}
export interface Asset extends Account {
  purchaseValue?: number;
  acquisitionDate?: string;
  notes?: string;
}
export interface Holding {
  name: string;
  ticker: string;
  quantity: number;
  price: number;
  cost: number;
}
export interface Connection {
  id: string;
  institutionId: string;
  owner: Owner;
  status: 'Connected' | 'Needs attention' | 'Imported' | 'Disconnected';
  lastSynced: string;
}
export type NetWorthSnapshot = { date: string } & Record<Owner, number>;
