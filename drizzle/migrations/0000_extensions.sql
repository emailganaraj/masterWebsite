-- PostgreSQL extensions (also in docker/init.sql for fresh containers)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Full-text search column (maintained by application on article save)
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;
CREATE INDEX IF NOT EXISTS "articles_search_vector_idx" ON "articles" USING GIN ("search_vector");
