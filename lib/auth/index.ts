import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import {
  ac,
  analystRole,
  authorRole,
  editorRole,
  superAdminRole,
} from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ],
  plugins: [
    adminPlugin({
      ac,
      roles: {
        SUPER_ADMIN: superAdminRole,
        EDITOR: editorRole,
        AUTHOR: authorRole,
        ANALYST: analystRole,
      },
      defaultRole: "AUTHOR",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
