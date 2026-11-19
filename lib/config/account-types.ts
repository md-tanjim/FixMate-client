
export const ACCOUNT_TYPES = {
  seeker: {
    label: "Seeker",
    defaultPlanId: "seeker_free",
  },

  recruiter: {
    label: "Recruiter",
    defaultPlanId: "recruiter_free",
  },
} as const;

export type AccountType = keyof typeof ACCOUNT_TYPES;

export const DEFAULT_ACCOUNT_TYPE: AccountType = "seeker";

export function isAccountType(value: unknown): value is AccountType {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(ACCOUNT_TYPES, value)
  );
}

export function getDefaultPlanId(accountType: AccountType) {
  return ACCOUNT_TYPES[accountType].defaultPlanId;
}
