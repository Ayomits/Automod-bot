from fastapi import FastAPI
from uvicorn import run
from dotenv import load_dotenv
from lib import config_service
from routers import automod_router

load_dotenv()

app = FastAPI(
  title="Automod API",
  description="An API for automod bot",
  root_path='/api'
)

APP_ENV = config_service.get("APP_ENV")

app.include_router(automod_router)

if __name__ == "__main__":
    run(app="main:app", port=8080, reload=APP_ENV == "dev")
