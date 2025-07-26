from fastapi import APIRouter, Body
from schemas import (
    AutomodClassicRequestSchema,
    AutomodMatch,
    AutomodEntry,
    AutomodRequestSchema,
    AutomodResponseSchema,
)
from services.automod import AutomodService

automod_router = APIRouter(prefix='/automod')

instance = AutomodService()


@automod_router.post("/", description="Запустить проверку сообщений на нарушение правил", response_model=AutomodResponseSchema, responses={
    200: {
        "description": "Выдаёт проверенные автомодом правила",
        "content": {
            "application/json": {
                "example": AutomodResponseSchema(matches=[AutomodMatch(user_id="snowflake", content="HELLO WORLD", rules=["CAPS"])])
            }
        },
    },
}, name="Run moderation pipeline", tags=["automod"])
async def automod_classic(schema: AutomodClassicRequestSchema = Body(
    examples={
        "default": AutomodRequestSchema(entries=[
            AutomodEntry(content="HELLO WORLD", user_id="snowflake")
        ])
    }
)):
    return instance.pipeline(schema)
