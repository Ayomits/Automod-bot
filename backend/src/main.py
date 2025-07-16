from fastapi import FastAPI
from uvicorn import run
from dotenv import load_dotenv
from lib import config_service

load_dotenv()

app = FastAPI(
  title="Automod API",
  description="An API for automod bot"
)

APP_ENV = config_service.get("APP_ENV")

if __name__ == "__main__":
  run(app="main:app", port=8080, reload=APP_ENV == "dev")
