from fastapi import APIRouter
from schemas import AutomodSchema
from automod import CapsLock, CapsLockType

automod_router = APIRouter(prefix='/automod')

instance = CapsLock()

@automod_router.post("/")
async def automod_classic(item: AutomodSchema):
    return instance.moderate(item.test, CapsLockType.Mixed)
