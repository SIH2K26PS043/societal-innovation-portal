"""Pydantic request models — MUST mirror packages/types (Zod) field-for-field.
Responses are returned as the standard envelope {"data": ..., "error": None}."""
from typing import Optional
from pydantic import BaseModel


class EmbedReq(BaseModel):
    texts: list[str]


class CategorizeReq(BaseModel):
    title: str
    description: str


class ProcessReq(BaseModel):
    problemId: str
    title: str
    description: str
    category: Optional[str] = None


class MatchReq(BaseModel):
    problemId: Optional[str] = None
    text: Optional[str] = None


class ValidateReq(BaseModel):
    title: str
    description: str


def ok(data):
    return {"data": data, "error": None}


def fail(code: str, message: str):
    return {"data": None, "error": {"code": code, "message": message}}
