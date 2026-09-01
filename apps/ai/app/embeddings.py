"""Sentence-transformers embeddings. Model loads once (warm) at first use."""
from functools import lru_cache
from .config import EMBEDDING_MODEL


@lru_cache(maxsize=1)
def get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(EMBEDDING_MODEL)


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_model()
    # normalize so cosine similarity == dot product; matches pgvector cosine ops
    vecs = model.encode(texts, normalize_embeddings=True)
    return [v.tolist() for v in vecs]


def embed_one(text: str) -> list[float]:
    return embed_texts([text])[0]


def is_loaded() -> bool:
    return get_model.cache_info().currsize > 0
