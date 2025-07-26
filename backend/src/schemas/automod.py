from pydantic import BaseModel, Field, ConfigDict

class AutomodEntry(BaseModel):
    content: str
    user_id: str


class AutomodRequestSchema(BaseModel):
    entries: list[AutomodEntry]
    model_config = ConfigDict(arbitrary_types_allowed=True)


class AutomodClassicRequestSchema(AutomodRequestSchema):
    rules: list[str] = Field(default=[])


class AutomodMatch(BaseModel):
    user_id: str
    content: str
    rules: list[str] = Field(default=[])


class AutomodResponseSchema(BaseModel):
    matches: list[AutomodMatch] = Field(default=[])
