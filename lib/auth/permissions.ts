import { createAccessControl } from "better-auth/plugins/access";

/**
 * RBAC permission statements for the publishing platform.
 * Custom roles must merge adminAc.statements when extending defaults.
 */
export const statement = {
  article: ["create", "read", "update", "delete", "publish", "review"],
  category: ["create", "read", "update", "delete"],
  tag: ["create", "read", "update", "delete"],
  media: ["create", "read", "update", "delete"],
  author: ["create", "read", "update", "delete"],
  user: ["create", "read", "update", "delete", "ban"],
  analytics: ["read"],
  adsense: ["read", "configure"],
  settings: ["read", "update"],
  audit: ["read"],
} as const;

export const ac = createAccessControl(statement);

export const superAdminRole = ac.newRole({
  article: ["create", "read", "update", "delete", "publish", "review"],
  category: ["create", "read", "update", "delete"],
  tag: ["create", "read", "update", "delete"],
  media: ["create", "read", "update", "delete"],
  author: ["create", "read", "update", "delete"],
  user: ["create", "read", "update", "delete", "ban"],
  analytics: ["read"],
  adsense: ["read", "configure"],
  settings: ["read", "update"],
  audit: ["read"],
});

export const editorRole = ac.newRole({
  article: ["create", "read", "update", "delete", "publish", "review"],
  category: ["create", "read", "update", "delete"],
  tag: ["create", "read", "update", "delete"],
  media: ["create", "read", "update", "delete"],
  author: ["create", "read", "update", "delete"],
  analytics: ["read"],
  adsense: ["read"],
  settings: ["read"],
});

export const authorRole = ac.newRole({
  article: ["create", "read", "update"],
  media: ["create", "read"],
  category: ["read"],
  tag: ["read"],
});

export const analystRole = ac.newRole({
  analytics: ["read"],
  adsense: ["read"],
  article: ["read"],
});

export type AppRole = "SUPER_ADMIN" | "EDITOR" | "AUTHOR" | "ANALYST";

export const roleMap = {
  SUPER_ADMIN: superAdminRole,
  EDITOR: editorRole,
  AUTHOR: authorRole,
  ANALYST: analystRole,
} as const;
