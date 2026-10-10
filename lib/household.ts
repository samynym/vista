// The people in your household. Edit the names to make Vista yours.
// Vista supports two members; 'Joint' holds what you own together.
export const members = ['Alex', 'Jordan'] as const;
export type Member = (typeof members)[number];
export const owners = [...members, 'Joint'] as const;
export const memberClass = (owner: string) =>
  owner === 'Joint'
    ? 'avatar-joint'
    : `avatar-member-${members.indexOf(owner as Member) + 1}`;
