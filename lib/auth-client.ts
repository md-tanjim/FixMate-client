import { createAuthClient } from "better-auth/react";

import {
  adminClient,
  inferAdditionalFields,
  jwtClient,
} from "better-auth/client/plugins";

import {
  ac,
  AUTH_ROLE_PERMISSIONS,
} from "@/lib/config/user-roles";

import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    // Infer custom user fields from the server-side auth configuration.
    inferAdditionalFields<typeof auth>(),

    // Client-side admin functionality with FixMate's custom roles.
    adminClient({
      ac,
      roles: AUTH_ROLE_PERMISSIONS,
    }),

    // Client-side JWT functionality.
    jwtClient(),
  ],
});

// Export commonly used authentication methods.
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;