"""Postgres + pgvector access. apps/ai owns the vector columns and the Cluster /
Assignment writes; everything else is owned by apps/web via Prisma.

NOTE: Prisma generates ids/updatedAt in its app layer, so raw INSERTs here must
supply `id` (and `updatedAt` where the model has @updatedAt). gen_id() mimics cuid."""
import uuid
from datetime import datetime, timezone
from typing import Optional


def _now():
    # Prisma DateTime columns are `timestamp` WITHOUT time zone; asyncpg needs a
    # naive datetime (a tz-aware one raises "can't subtract offset-naive/aware").
    return datetime.now(timezone.utc).replace(tzinfo=None)

import asyncpg
import numpy as np
from pgvector.asyncpg import register_vector

from .config import DATABASE_URL

_pool: Optional[asyncpg.Pool] = None


def gen_id(prefix: str = "c") -> str:
    return prefix + uuid.uuid4().hex[:24]  # 25 chars, cuid-like


def _clean_url(url: str) -> str:
    # asyncpg does not accept ?schema=... style query params
    return url.split("?")[0]


async def _init_conn(conn: asyncpg.Connection):
    await register_vector(conn)


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            _clean_url(DATABASE_URL), min_size=1, max_size=5, init=_init_conn
        )
    return _pool


def _vec(v: list[float]) -> np.ndarray:
    return np.asarray(v, dtype=np.float32)


# ── writes ────────────────────────────────────────────────────────────────────
async def store_problem_embedding(problem_id: str, vec: list[float]):
    pool = await get_pool()
    async with pool.acquire() as c:
        await c.execute('UPDATE "Problem" SET embedding = $1 WHERE id = $2', _vec(vec), problem_id)


async def store_faculty_embedding(faculty_id: str, vec: list[float]):
    pool = await get_pool()
    async with pool.acquire() as c:
        await c.execute('UPDATE "FacultyProfile" SET "expertiseEmbedding" = $1 WHERE id = $2', _vec(vec), faculty_id)


async def store_industry_embedding(industry_id: str, vec: list[float]):
    pool = await get_pool()
    async with pool.acquire() as c:
        await c.execute('UPDATE "IndustryProfile" SET "expertiseEmbedding" = $1 WHERE id = $2', _vec(vec), industry_id)


# ── dedup / clustering ────────────────────────────────────────────────────────
async def similar_problems(vec: list[float], exclude_id: str, limit: int = 10):
    pool = await get_pool()
    async with pool.acquire() as c:
        rows = await c.fetch(
            '''SELECT id, "clusterId" AS cluster_id,
                      1 - (embedding <=> $1) AS score
               FROM "Problem"
               WHERE embedding IS NOT NULL AND id <> $2
               ORDER BY embedding <=> $1
               LIMIT $3''',
            _vec(vec), exclude_id, limit,
        )
        return [dict(r) for r in rows]


async def assign_cluster(problem_id: str, cluster_id: str):
    pool = await get_pool()
    async with pool.acquire() as c:
        await c.execute('UPDATE "Problem" SET "clusterId" = $1 WHERE id = $2', cluster_id, problem_id)
        size = await c.fetchval('SELECT COUNT(*) FROM "Problem" WHERE "clusterId" = $1', cluster_id)
        await c.execute('UPDATE "Cluster" SET size = $1, "updatedAt" = $2 WHERE id = $3',
                        size, _now(), cluster_id)
        return size


async def create_cluster(title: str, category: str, centroid: list[float]) -> str:
    pool = await get_pool()
    cid = gen_id()
    now = _now()
    async with pool.acquire() as c:
        await c.execute(
            '''INSERT INTO "Cluster" (id, title, category, size, centroid, "createdAt", "updatedAt")
               VALUES ($1, $2, $3::"Category", 1, $4, $5, $5)''',
            cid, title, category, _vec(centroid), now,
        )
    return cid


async def get_problem_text(problem_id: str) -> Optional[str]:
    pool = await get_pool()
    async with pool.acquire() as c:
        row = await c.fetchrow('SELECT title, description FROM "Problem" WHERE id = $1', problem_id)
        if not row:
            return None
        return f'{row["title"]}. {row["description"]}'


# ── expertise matching ────────────────────────────────────────────────────────
async def match_faculty(vec: list[float], limit: int = 5):
    pool = await get_pool()
    async with pool.acquire() as c:
        rows = await c.fetch(
            '''SELECT f.id AS faculty_id, f."universityId" AS university_id,
                      f."researchAreas" AS research_areas,
                      1 - (f."expertiseEmbedding" <=> $1) AS score
               FROM "FacultyProfile" f
               WHERE f."expertiseEmbedding" IS NOT NULL
               ORDER BY f."expertiseEmbedding" <=> $1
               LIMIT $2''',
            _vec(vec), limit,
        )
        return [dict(r) for r in rows]


async def match_industry(vec: list[float], limit: int = 3):
    pool = await get_pool()
    async with pool.acquire() as c:
        rows = await c.fetch(
            '''SELECT p.id AS partner_id, p."companyName" AS company, p.sector AS sector,
                      1 - (p."expertiseEmbedding" <=> $1) AS score
               FROM "IndustryProfile" p
               WHERE p."expertiseEmbedding" IS NOT NULL
               ORDER BY p."expertiseEmbedding" <=> $1
               LIMIT $2''',
            _vec(vec), limit,
        )
        return [dict(r) for r in rows]


async def upsert_assignment(problem_id: str, university_id: str, faculty_id: Optional[str],
                            score: float, reason: str):
    pool = await get_pool()
    async with pool.acquire() as c:
        await c.execute(
            '''INSERT INTO "Assignment" (id, "problemId", "universityId", "facultyId", "matchScore", reason, "createdAt")
               VALUES ($1, $2, $3, $4, $5, $6, now())
               ON CONFLICT ("problemId")
               DO UPDATE SET "universityId" = EXCLUDED."universityId",
                             "facultyId"   = EXCLUDED."facultyId",
                             "matchScore"  = EXCLUDED."matchScore",
                             reason        = EXCLUDED.reason''',
            gen_id(), problem_id, university_id, faculty_id, score, reason,
        )
