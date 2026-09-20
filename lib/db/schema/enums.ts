import { pgEnum } from "drizzle-orm/pg-core";

export const articleStatusEnum = pgEnum("article_status", [
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
]);

export const pageStatusEnum = pgEnum("page_status", ["draft", "published"]);

export const adSlotTypeEnum = pgEnum("ad_slot_type", [
  "adsense",
  "direct",
  "affiliate",
  "sponsored",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "archive",
  "restore",
  "login",
  "logout",
  "role_change",
  "settings_change",
]);

export const roleNameEnum = pgEnum("role_name", [
  "SUPER_ADMIN",
  "EDITOR",
  "AUTHOR",
  "ANALYST",
]);

export const homepageSectionTypeEnum = pgEnum("homepage_section_type", [
  "hero",
  "trending",
  "latest",
  "popular",
  "editors_picks",
  "category_block",
  "recommended",
  "custom",
]);
