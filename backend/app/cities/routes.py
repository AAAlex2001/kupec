from fastapi import APIRouter, Depends, HTTPException, Query, status

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


@router.get("/{city_id}")
async def get_city(
    city_id: int,
    cities: CityRepository = Depends(get_city_repository),
) -> CitySchema:
    """Населённый пункт по id — например, выбранный посетителем в шапке."""

    city = await cities.get_by_id(city_id)
    if city is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Населённый пункт не найден",
        )

    return CitySchema.model_validate(city)
