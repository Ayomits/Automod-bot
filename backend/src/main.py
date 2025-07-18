from fastapi import FastAPI
from uvicorn import run
from dotenv import load_dotenv
from lib import config_service
from routers import automod_router

load_dotenv()

APP_ENV = config_service.get("APP_ENV")

app = FastAPI(
  title="Automod API",
  description="An API for automod bot",
  root_path='/api',
  debug=APP_ENV == "debug",
)

app.include_router(automod_router)

if __name__ == "__main__":
    run(app="main:app", port=8080, reload=APP_ENV == "dev" or APP_ENV == "debug")
