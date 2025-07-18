from fastapi import APIRouter, Body
from schemas import AutomodRequestSchema, AutomodResponseSchema, AutomodMessage
from automod import Automod

automod_router = APIRouter(prefix='/automod')

instance = Automod()

@automod_router.post("/", response_model=AutomodResponseSchema, name="Run moderation pipeline", tags=["automod"])
async def automod_classic(item: AutomodRequestSchema = Body(
    examples={
        "default": AutomodRequestSchema(messages=[
            AutomodMessage(content="HELLO WORLD", user_id="snowflake")
        ])
    }
)):
    return instance.pipeline(item)
