"""Run AFTER `pnpm db:seed` to populate vector columns + clusters + assignments,
so the seeded data demonstrates dedup and matching immediately.

  cd apps/ai
  python -m app.scripts.backfill_embeddings

Order matters: embed faculty first (so expertise matching has targets), then run the
full pipeline on every problem (this clusters the 8 Ranchi water duplicates and routes
each problem to its best-fit professor)."""
import asyncio

from .. import db, matching
from ..embeddings import embed_one


async def main():
    pool = await db.get_pool()
    async with pool.acquire() as c:
        # 1) faculty expertise embeddings
        faculty = await c.fetch('SELECT id, "researchAreas" FROM "FacultyProfile" WHERE "expertiseEmbedding" IS NULL')
        for r in faculty:
            areas = r["researchAreas"] or []
            if areas:
                await db.store_faculty_embedding(r["id"], embed_one(", ".join(areas)))

        # 2) industry partner expertise embeddings (sector + company + description)
        industry = await c.fetch(
            'SELECT id, "companyName", sector, description FROM "IndustryProfile" WHERE "expertiseEmbedding" IS NULL')
        for r in industry:
            parts = [p for p in (r["sector"], r["companyName"], r["description"]) if p]
            if parts:
                await db.store_industry_embedding(r["id"], embed_one(". ".join(parts)))

        # 3) run the full pipeline on every problem (embed + cluster + match)
        problems = await c.fetch('SELECT id, title, description, category::text AS category FROM "Problem"')

    processed = 0
    for r in problems:
        await matching.process(r["id"], r["title"], r["description"], r["category"])
        processed += 1

    print(f"Backfilled {len(faculty)} faculty + {len(industry)} industry embeddings; processed {processed} problems.")
    print("Check: the 8 Ranchi water reports should now share one cluster.")


if __name__ == "__main__":
    asyncio.run(main())
