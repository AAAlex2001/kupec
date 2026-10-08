from pydantic import BaseModel, ConfigDict, Field


class CitySchema(BaseModel):
    """Населённый пункт."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID населённого пункта")
    name: str = Field(..., description="Название")
    district: str | None = Field(
        None, description="Район, чтобы различать одноимённые сёла. У городов пусто"
    )
