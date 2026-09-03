"""Unit tests for the deterministic, offline parts of the AI service
(priority, severity, categorization, validation, expertise text). No DB, no network.
Run from apps/ai:  python -m pytest -q"""
import math

from app import matching, validate
from app.categorize import keyword_category, _extract_category


# ── priority (A4) ────────────────────────────────────────────────────────────
def test_priority_is_transparent_formula():
    # log(size+1)*2 + hits*0.6 + categoryWeight(WATER=1.5)
    expected = round(math.log(9) * 2.0 + 2 * 0.6 + 1.5, 2)
    assert matching.priority_score(8, "WATER", 2) == expected


def test_priority_grows_with_cluster_size_and_severity():
    assert matching.priority_score(50, "WATER", 3) > matching.priority_score(2, "WATER", 0)


def test_priority_unknown_category_has_zero_weight():
    assert matching.priority_score(4, "OTHER", 0) == round(math.log(5) * 2.0, 2)


def test_count_severity():
    assert matching.count_severity("pipeline burst, no water for 3 days") >= 2
    assert matching.count_severity("a calm ordinary note") == 0


# ── categorize (A1) — keyword fallback is deterministic & offline ────────────
def test_keyword_category_water():
    cat, conf = keyword_category("no drinking water, pipeline burst near the borewell")
    assert cat == "WATER" and conf > 0.5


def test_keyword_category_unknown_is_other():
    cat, conf = keyword_category("xyzzy plugh frobnicate")
    assert cat == "OTHER"


def test_extract_category_from_verbose_llm_reply():
    assert _extract_category("Category: WATER.") == "WATER"
    assert _extract_category("I think this is HEALTH related") == "HEALTH"
    assert _extract_category("no idea") is None


# ── validate (A5) ────────────────────────────────────────────────────────────
def test_validate_accepts_a_real_report():
    r = validate.validate("No water for 3 days", "The main pipeline in ward 4 burst and there is no supply.")
    assert r["isValid"] and not r["isSpam"] and r["quality"] > 0.4 and r["reason"] == ""


def test_validate_flags_too_short():
    r = validate.validate("hi", "")
    assert r["isSpam"] and not r["isValid"] and "short" in r["reason"]


def test_validate_flags_link_spam():
    r = validate.validate("buy now", "http://a.com http://b.com http://c.com cheap deals")
    assert r["isSpam"] and "spam" in r["reason"]


def test_validate_never_raises_on_empty():
    r = validate.validate("", "")
    assert r["isSpam"] and isinstance(r["quality"], float)


# ── expertise text helpers ───────────────────────────────────────────────────
def test_faculty_expertise_text_keeps_terms():
    t = matching.faculty_expertise_text(["water resources", "hydrology"])
    assert "water resources" in t and "hydrology" in t


def test_faculty_expertise_text_empty():
    assert matching.faculty_expertise_text([]) == ""


def test_industry_expertise_text():
    t = matching.industry_expertise_text("AquaWorks", "water technology", "Builds filtration systems.")
    assert "AquaWorks" in t and "water technology" in t and "filtration" in t
