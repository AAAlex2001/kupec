from fastapi import APIRouter, Depends, Query

from app.cities.dependencies import get_city_repository
from app.cities.schemas import CitySchema
from app.cities.services.repo import CityRepository

router = APIRouter(prefix="/cities", tags=["cities"])


@router.get("")
async def search_cities(
    q: str | None = Query(None, max_length=100, description="Начало названия"),
    limit: int = Query(20, ge=1, le=50),
    cities: CityRepository = Depends(get_city_repository),
) -> list[CitySchema]:
    """Поиск населённого пункта для профиля и объявления. Без q — крупные города."""

    items = await cities.search(q.strip() if q else None, limit)

    return [CitySchema.model_validate(city) for city in items]
