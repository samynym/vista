import assert from 'node:assert/strict';
import {members} from '../lib/household.ts';
import {initialAccounts,initialConnections,filterByOwner,holdingsFor,sum,snapshots,historyFor,periods,institutions} from '../lib/mock-data.ts';
const [A,B]=members;
const expected={Household:428240,[A]:302420,[B]:89420};
for(const [owner,total] of Object.entries(expected)){
 const accounts=filterByOwner(initialAccounts,owner);
 assert.equal(sum(accounts),total,`${owner} total`);
 for(const p of periods){const h=historyFor(owner,p);assert.ok(h.length>=30);assert.ok(Math.abs(h.at(-1).value-total)<.001);}
 if(owner!=='Household')assert.ok(accounts.every(a=>a.owner===owner));
}
assert.equal(sum(initialAccounts.filter(a=>a.owner==='Joint')),36400);
assert.equal(sum(initialAccounts.filter(a=>a.institutionId==='ee')),29400);
assert.equal(snapshots[0].date,'2025-03-08');assert.equal(snapshots.at(-1).date,'2026-09-07');
assert.equal(new Set(initialAccounts.map(a=>a.id)).size,initialAccounts.length);
for(const a of initialAccounts){assert.ok(institutions.some(i=>i.id===a.institutionId));const holdings=holdingsFor(a);if(holdings.length)assert.ok(Math.abs(sum(holdings.map(h=>({value:h.quantity*h.price})))+(a.cash||0)-a.value)<.0001);if(a.institutionId!=='manual')assert.ok(initialConnections.some(c=>c.institutionId===a.institutionId&&c.owner===a.owner));}
console.log('PASS: household and owner totals, EasyEquities accounts, 18-month history, all chart periods, account IDs, institution links, holdings + cash, and connection ownership.');
