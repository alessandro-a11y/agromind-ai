from contextlib import asynccontextmanager

import httpx
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from core.logging import configure_logging
from routers import chat, diagnosis, prediction
from services.groq_service import GroqService

load_dotenv()

configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    timeout = httpx.Timeout(settings.groq_timeout_seconds)

    async with httpx.AsyncClient(base_url=settings.groq_base_url, timeout=timeout) as client:
        app.state.groq_service = GroqService(client, settings)
        yield


app = FastAPI(
    title="AgroMind IA Service",
    version="1.0.0",
    lifespan=lifespan,
)

# Configura CORS a partir da variável ALLOWED_ORIGINS (lista separada por vírgula) ou fallback vazio
allowed = os.getenv("ALLOWED_ORIGINS", "").strip()
origins = [o.strip() for o in allowed.split(",") if o.strip()] if allowed else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or [],
    allow_methods=["GET", "POST"],
    allow_headers=["content-type", "x-api-key"],
)

app.include_router(chat.router)
app.include_router(diagnosis.router)
app.include_router(prediction.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "agromind-ia"}


@app.get("/")
def root():
    return {"message": "AgroMind IA Service rodando"}

