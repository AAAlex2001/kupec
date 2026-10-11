from pydantic import BaseModel, ConfigDict, Field


class CitySchema(BaseModel):
    """Населённый пункт."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="ID населённого пункта")
    name: str = Field(..., description="Название")
    region: str = Field(..., description="Регион")
    settlement_type: str | None = Field(None, description="Тип населённого пункта")
    district: str | None = Field(
        None, description="Район и родительский населённый пункт"
    )
