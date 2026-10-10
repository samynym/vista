import { NetWorth, Ownership, Allocation } from '@/components/wealth/charts';
import { AccountGroups, Insights, Movers } from '@/components/wealth/overview';
export default function Overview() {
  return (
    <>
      <NetWorth />
      <div className="overview-body">
        <AccountGroups />
        <div className="overview-side">
          <Insights />
          <Movers />
          <Allocation />
          <Ownership />
        </div>
      </div>
    </>
  );
}
