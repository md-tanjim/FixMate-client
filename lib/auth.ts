// import dns from "node:dns";

// dns.setServers(["8.8.8.8", "8.8.4.4"]);
// console.log(
//   "[Next.js Auth] DNS servers:",
//   dns.getServers()
// );
import { betterAuth } from "better-auth";
import { MongoClient,ObjectId } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import {
  APIError,
  createAuthMiddleware,
} from "better-auth/api";

import {
  admin as adminPlugin,
  jwt,
} from "better-auth/plugins";

import {
  ac,
  AUTH_ROLE_PERMISSIONS,
  DEFAULT_USER_ROLE,
  isSignupRole,
  isUserRole,
  UserRole,
} from "@/lib/config/user-roles";

// --------------------------------------------------
// 1. MongoDB connection
// --------------------------------------------------

const mongoUrl = process.env.MONGO_DB_URL;

if (!mongoUrl) {
  throw new Error("MONGO_DB_URL is not defined.");
}

const client = new MongoClient(mongoUrl);
const db = client.db("assignment-9");

// --------------------------------------------------
// 2. Better Auth configuration
// --------------------------------------------------

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  database: mongodbAdapter(db, { client }),

  // ------------------------------------------------
  // Email and password authentication
  // ------------------------------------------------

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  // Google authentication
  // New Google users receive the default customer role.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // ------------------------------------------------
  // 3. Additional user fields
  // ------------------------------------------------

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
        input: true,
        returned: true,
      },

      area: {
        type: "string",
        required: false,
        input: true,
        returned: true,
      },

      bio: {
        type: "string",
        required: false,
        input: true,
        returned: true,
      },

      // Temporary field used only during public signup.
      // It is removed before the user is saved.
      signupRole: {
        type: "string",
        required: false,
        input: true,
        returned: false,
      },

      
    },
  },

  // ------------------------------------------------
  // 4. Plugins
  // ------------------------------------------------

  plugins: [
    adminPlugin({
      ac,
      roles: AUTH_ROLE_PERMISSIONS,

      // All new users start as customers unless the
      // signup database hook assigns technician.
      defaultRole: DEFAULT_USER_ROLE,

      adminRoles: ["admin"],

      bannedUserMessage:
        "Your account has been suspended. Please contact support if you believe this is a mistake.",
    }),

    // JWT and JWKS support for the future Express backend.
    jwt({
      sessionCookieCache: true,
    }),
  ],

  // ------------------------------------------------
  // 5. Session configuration
  // ------------------------------------------------

  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 5 * 60,
    },
  },

  // ------------------------------------------------
  // 6. Initialize the user role
  // ------------------------------------------------
databaseHooks: {
  user: {
    create: {
      // Decide the role and keep signupRole out of the data when possible.
      before: async (user) => {
        const { signupRole, ...userData } = user as typeof user & {
          signupRole?: unknown;
        };

        let role: UserRole;

        if (isSignupRole(signupRole)) {
          role = signupRole;
        } else if (isUserRole(user.role)) {
          role = user.role;
        } else {
          role = DEFAULT_USER_ROLE;
        }

        return {
          data: {
            ...userData,
            role,
          },
        };
      },

      // Better Auth may merge the before-hook result back into the original
      // data, so signupRole can still be written. Remove it after creation.
      after: async (user) => {
        try {
          const filter = ObjectId.isValid(user.id)
            ? { $or: [{ _id: new ObjectId(user.id) }, { id: user.id }] }
            : { id: user.id };

          await db
            .collection("user")
            .updateOne(filter, { $unset: { signupRole: "" } });
        } catch (error) {
          // Never fail a signup because of cleanup.
          console.error("Failed to remove signupRole from user:", error);
        }
      },
    },
  },
},

  // ------------------------------------------------
  // 7. Security hooks
  // ------------------------------------------------

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // ----------------------------------------------
      // Public email signup password validation
      // ----------------------------------------------

      if (ctx.path === "/sign-up/email") {
        const password = ctx.body?.password;

        const isValidPassword =
          typeof password === "string" &&
          password.length >= 6 &&
          /[A-Z]/.test(password) &&
          /[a-z]/.test(password);

        if (!isValidPassword) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Password must contain at least 6 characters, one uppercase letter, and one lowercase letter.",
          });
        }
      }

      // ----------------------------------------------
      // Protect user profile and role fields
      // ----------------------------------------------

      if (ctx.path === "/update-user" && ctx.body) {
        const protectedFields = [
          "role",
          "signupRole",
          "email",
          "banned",
          "banReason",
          "banExpires",
        ];

        const attemptedProtectedUpdate =
          protectedFields.some((field) => field in ctx.body!);

        if (attemptedProtectedUpdate) {
          throw new APIError("FORBIDDEN", {
            message:
              "You cannot modify your email, role, or account permissions through profile updates.",
          });
        }
      }

      // ----------------------------------------------
      // Validate Admin role changes
      // ----------------------------------------------

      if (ctx.path === "/admin/set-role" && ctx.body) {
        if (!isUserRole(ctx.body.role)) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid user role.",
          });
        }
      }
    }),
  },
});
