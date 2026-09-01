"""Dedup/clustering (A2) + expertise matching (A3) + priority (A4).
These are the differentiating features — refine here (M3)."""
import math
from typing import Optional

from . import db
from .config import DEDUP_THRESHOLD
from .embeddings import embed_one


def _reason(research_areas) -> str:
    areas = (research_areas or [])[:3]
    return "matched on: " + ", ".join(areas) if areas else "closest expertise match"


async def process(problem_id: str, title: str, description: str, category: Optional[str]):
    text = f"{title}. {description}"
    vec = embed_one(text)
    await db.store_problem_embedding(problem_id, vec)

    # ── dedup / cluster ──
    similar = await db.similar_problems(vec, exclude_id=problem_id, limit=10)
    dupes = [s for s in similar if s["score"] >= DEDUP_THRESHOLD]

    cluster_id = next((s["cluster_id"] for s in dupes if s["cluster_id"]), None)
    if cluster_id is None:
        cluster_id = await db.create_cluster(title[:120], category or "OTHER", vec)
    cluster_size = await db.assign_cluster(problem_id, cluster_id)

    # ── expertise match ──
    matches = await db.match_faculty(vec, limit=5)
    assignment = None
    if matches:
        top = matches[0]
        reason = _reason(top.get("research_areas"))
        await db.upsert_assignment(problem_id, top["university_id"], top["faculty_id"],
                                   float(top["score"]), reason)
        assignment = {
            "universityId": top["university_id"],
            "facultyId": top["faculty_id"],
            "matchScore": round(float(top["score"]), 3),
            "reason": reason,
        }

    # ── priority (A4) — transparent, explainable ──
    bump = 1.5 if category in ("WATER", "HEALTH") else 0.0
    priority = round(math.log(cluster_size + 1) * 2.0 + bump, 2)

    return {
        "clusterId": cluster_id,
        "clusterSize": cluster_size,
        "isDuplicate": len(dupes) > 0,
        "similar": [{"problemId": s["id"], "score": round(float(s["score"]), 3)} for s in dupes],
        "assignment": assignment,
        "priorityScore": priority,
    }


async def match_university(problem_id: Optional[str], text: Optional[str]):
    if not text and problem_id:
        text = await db.get_problem_text(problem_id)
    if not text:
        return {"matches": []}
    vec = embed_one(text)
    matches = await db.match_faculty(vec, limit=5)
    return {
        "matches": [
            {
                "universityId": m["university_id"],
                "facultyId": m["faculty_id"],
                "score": round(float(m["score"]), 3),
                "reason": _reason(m.get("research_areas")),
            }
            for m in matches
        ]
    }
