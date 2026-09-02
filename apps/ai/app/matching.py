"""Dedup/clustering (A2) + expertise matching (A3) + industry matching (I2) +
priority (A4). These are the differentiating features — refine here (M3)."""
import math
from typing import Optional

from . import db
from .config import DEDUP_THRESHOLD
from .embeddings import embed_one


def _reason(research_areas) -> str:
    areas = (research_areas or [])[:3]
    return "matched on: " + ", ".join(areas) if areas else "closest expertise match"


# ── priority (A4) — deliberately transparent so it's explainable to judges ──────
# score = log(clusterSize+1)*W_SIZE + severityHits*W_SEV + categoryWeight
W_SIZE, W_SEV = 2.0, 0.6
CATEGORY_WEIGHT = {
    "HEALTH": 1.5, "WATER": 1.5, "SANITATION": 1.2, "ENERGY": 1.0,
    "INFRASTRUCTURE": 0.8, "AGRICULTURE": 0.8, "ENVIRONMENT": 0.6,
}
SEVERITY_WORDS = [
    "burst", "urgent", "emergency", "children", "child", "died", "death", "danger",
    "collapse", "fire", "flood", "injured", "outbreak", "hospital", "no water",
    "days", "week", "severe", "critical", "contaminated",
]


def count_severity(text: str) -> int:
    t = (text or "").lower()
    return sum(1 for w in SEVERITY_WORDS if w in t)


def priority_score(cluster_size: int, category: Optional[str], severity_hits: int) -> float:
    base = math.log(cluster_size + 1) * W_SIZE
    return round(base + severity_hits * W_SEV + CATEGORY_WEIGHT.get(category or "", 0.0), 2)


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
    priority = priority_score(cluster_size, category, count_severity(text))

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


async def match_industry(problem_id: Optional[str], text: Optional[str]):
    """I2 — rank industry partners by expertise similarity to a problem/project."""
    if not text and problem_id:
        text = await db.get_problem_text(problem_id)
    if not text:
        return {"matches": []}
    vec = embed_one(text)
    matches = await db.match_industry(vec, limit=3)
    return {
        "matches": [
            {
                "partnerId": m["partner_id"],
                "score": round(float(m["score"]), 3),
                "reason": f"sector: {m['sector']}" if m.get("sector") else "closest partner match",
            }
            for m in matches
        ]
    }
