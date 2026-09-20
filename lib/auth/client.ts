"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import {
  ac,
  analystRole,
  authorRole,
  editorRole,
  superAdminRole,
} from "./permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        SUPER_ADMIN: superAdminRole,
        EDITOR: editorRole,
        AUTHOR: authorRole,
        ANALYST: analystRole,
      },
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
