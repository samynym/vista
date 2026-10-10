'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Institution, Owner, OwnerFilter } from '@/lib/models';
import { useWealth } from '@/lib/wealth-context';
import { members, memberClass } from '@/lib/household';
export function Picker({
  value,
  onChange,
  options,
  label,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger aria-label={label} className={`picker ${className}`}>
        <SelectValue>{value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem value={o} key={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
/** Pill switch between the household view and each person's view. */
export function OwnerToggle({ dark = false }: { dark?: boolean }) {
  const w = useWealth();
  return (
    <fieldset
      aria-label="Whose wealth to show"
      className={`segmented ${dark ? 'on-dark' : ''}`}
    >
      {(['Household', ...members] as OwnerFilter[]).map((o) => (
        <button
          key={o}
          aria-pressed={w.owner === o}
          className={w.owner === o ? 'selected' : ''}
          onClick={() => w.setOwner(o)}
        >
          {o}
        </button>
      ))}
    </fieldset>
  );
}
export function Avatar({ owner }: { owner: Owner }) {
  return (
    <span className={`avatar ${memberClass(owner)}`}>
      {owner === 'Joint' ? members.map((m) => m[0]).join('+') : owner[0]}
    </span>
  );
}
export function Logo({ institution }: { institution: Institution }) {
  return (
    <span
      className="institution-logo"
      style={{ color: institution.color, background: institution.color + '14' }}
      aria-hidden="true"
    >
      {institution.short}
    </span>
  );
}
export function Change({
  value,
  label = '',
}: {
  value: number;
  label?: string;
}) {
  return (
    <span
      className={`change ${value < 0 ? 'negative' : value === 0 ? 'flat' : ''}`}
    >
      {value > 0 ? '+' : value < 0 ? '−' : ''}
      {Math.abs(value).toFixed(1)}%
      {label && <span className="change-label">{label}</span>}
    </span>
  );
}
export function PanelTitle({
  title,
  aside,
}: {
  title: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      {aside}
    </div>
  );
}
