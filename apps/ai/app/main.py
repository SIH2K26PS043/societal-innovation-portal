"""FastAPI entrypoint. Contract: docs/04-AI-SERVICE.md. Every response uses the
standard {"data": ..., "error": ...} envelope so apps/web can rely on one shape."""
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException

from . import categorize as cat
from . import embeddings, matching
from . import validate as vld
from .config import AI_SERVICE_KEY
from .schemas import (CategorizeReq, EmbedReq, MatchReq, PriorityReq, ProcessReq, ValidateReq, fail, ok)

log = logging.getLogger("ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # X4 demo safety: warm the embedding model once at startup so /health is
    # truthful and the first real request isn't slow. Never block startup on it.
    try:
        embeddings.get_model()
        log.info("embedding model warmed")
    except Exception as e:  # noqa: BLE001
        log.warning("model warmup failed (will lazy-load): %s", e)
    yield


app = FastAPI(title="SIH26043 AI Service", version="0.1.0", lifespan=lifespan)


def require_key(x_ai_key: str = Header(default="", alias="x-ai-key")):
    if x_ai_key != AI_SERVICE_KEY:
        raise HTTPException(status_code=401, detail="invalid x-ai-key")


@app.get("/health")
async def health():
    return ok({"status": "ok", "model_loaded": embeddings.is_loaded()})


@app.post("/embed", dependencies=[Depends(require_key)])
async def embed(req: EmbedReq):
    try:
        return ok({"embeddings": embeddings.embed_texts(req.texts)})
    except Exception as e:  # noqa: BLE001
        return fail("SERVER", str(e))


@app.post("/categorize", dependencies=[Depends(require_key)])
async def categorize(req: CategorizeReq):
    try:
        category, confidence = await cat.categorize(req.title, req.description)
        return ok({"category": category, "confidence": confidence})
    except Exception as e:  # noqa: BLE001
        return fail("SERVER", str(e))


@app.post("/process", dependencies=[Depends(require_key)])
async def process(req: ProcessReq):
    try:
        result = await matching.process(req.problemId, req.title, req.description, req.category)
        return ok(result)
    except Exception as e:  # noqa: BLE001
        return fail("SERVER", str(e))


@app.post("/match/university", dependencies=[Depends(require_key)])
async def match_university(req: MatchReq):
    try:
        return ok(await matching.match_university(req.problemId, req.text))
    except Exception as e:  # noqa: BLE001
        return fail("SERVER", str(e))


@app.post("/match/industry", dependencies=[Depends(require_key)])
async def match_industry(req: MatchReq):
    try:
        return ok(await matching.match_industry(req.problemId, req.text))
    except Exception as e:  # noqa: BLE001
        return fail("SERVER", str(e))


@app.post("/priority", dependencies=[Depends(require_key)])
async def priority(req: PriorityReq):
    try:
        score = matching.priority_score(req.clusterSize, req.category, len(req.severityKeywords))
        return ok({"score": score})
    except Exception as e:  # noqa: BLE001
        return fail("SERVER", str(e))


@app.post("/validate", dependencies=[Depends(require_key)])
async def validate(req: ValidateReq):
    # A5 — offline spam/quality check; always returns a result.
    return ok(vld.validate(req.title, req.description))
