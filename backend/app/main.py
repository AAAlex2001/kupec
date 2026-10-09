from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.admin import catalog_routes as admin_catalog
from app.admin import routes as admin
from app.auth import routes as auth
from app.catalog import routes as catalog
from app.chats import routes as chats
from app.cities import routes as cities
from app.core.config import MEDIA_URL, get_settings
from app.favorites import routes as favorites
from app.listings import routes as listings
from app.reviews import routes as reviews
from app.users import routes as users

settings = get_settings()

app = FastAPI(
    title="Kupec API",
    version="0.1.0",
    docs_url="/api/docs" if settings.debug else None,
    openapi_url="/api/openapi.json" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next) -> Response:
    """Защитные заголовки: браузер не угадывает тип файла, сайт нельзя встроить в чужой iframe."""

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    return response


@app.get("/api/health", tags=["service"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(cities.router, prefix="/api/v1")
app.include_router(catalog.router, prefix="/api/v1")
app.include_router(listings.router, prefix="/api/v1")
app.include_router(favorites.router, prefix="/api/v1")
app.include_router(chats.router, prefix="/api/v1")
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(admin_catalog.router, prefix="/api/v1")

Path(settings.media_dir).mkdir(parents=True, exist_ok=True)
app.mount(MEDIA_URL, StaticFiles(directory=settings.media_dir), name="media")
