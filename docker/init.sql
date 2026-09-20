-- Extensions for search (Phase 4) and UUID support
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Full-text search vector on articles (populated by application on save)
-- Added after tables exist via migration; this prepares extensions only.
