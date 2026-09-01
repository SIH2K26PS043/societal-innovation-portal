-- Run AFTER `prisma migrate dev`. Adds pgvector columns Prisma can't model.
-- Owned by apps/ai; M1 runs this once per fresh database.
--   psql "$DIRECT_URL" -f packages/db/prisma/migrations/manual_vectors.sql

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "Problem"          ADD COLUMN IF NOT EXISTS embedding vector(384);
ALTER TABLE "FacultyProfile"   ADD COLUMN IF NOT EXISTS "expertiseEmbedding" vector(384);
ALTER TABLE "Cluster"          ADD COLUMN IF NOT EXISTS centroid vector(384);
ALTER TABLE "IndustryProfile"  ADD COLUMN IF NOT EXISTS "expertiseEmbedding" vector(384);

-- cosine similarity indexes
CREATE INDEX IF NOT EXISTS problem_embedding_idx
  ON "Problem" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS faculty_expertise_idx
  ON "FacultyProfile" USING ivfflat ("expertiseEmbedding" vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS industry_expertise_idx
  ON "IndustryProfile" USING ivfflat ("expertiseEmbedding" vector_cosine_ops) WITH (lists = 100);
