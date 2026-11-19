import { createAccessControl } from "better-auth/plugins/access";

import {
  defaultStatements,
  adminAc,
} from "better-auth/plugins/admin/access";

// --------------------------------------------------
// 1. Application roles
// --------------------------------------------------

export const USER_ROLES = {
  customer: {
    label: "Customer",
  },
  technician: {
    label: "Technician",
  },
  admin: {
    label: "Admin",
  },
} as const;

export type UserRole = keyof typeof USER_ROLES;

// Default role for newly registered users.
export const DEFAULT_USER_ROLE = "customer" satisfies UserRole;

// Only these roles are allowed during public signup.
export const SIGNUP_ROLES = ["customer", "technician"] as const;

export type SignupRole = (typeof SIGNUP_ROLES)[number];

// --------------------------------------------------
// 2. Role validation
// --------------------------------------------------

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(USER_ROLES, value)
  );
}

export function isSignupRole(value: unknown): value is SignupRole {
  return SIGNUP_ROLES.some((role) => role === value);
}

// --------------------------------------------------
// 3. Better Auth Admin plugin access control
// --------------------------------------------------

export const ac = createAccessControl(defaultStatements);

// Customers cannot manage users or sessions through
// the Better Auth Admin plugin.
export const customerAuthRole = ac.newRole({
  user: [],
  session: [],
});

// Technicians cannot manage users or sessions either.
export const technicianAuthRole = ac.newRole({
  user: [],
  session: [],
});

// Admin receives the default Admin plugin permissions.
export const adminAuthRole = ac.newRole({
  ...adminAc.statements,
});

// All roles registered with the Admin plugin.
export const AUTH_ROLE_PERMISSIONS = {
  customer: customerAuthRole,
  technician: technicianAuthRole,
  admin: adminAuthRole,
} as const;