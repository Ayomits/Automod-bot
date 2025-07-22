from dotenv import load_dotenv
from os import environ

class Config:

  def __init__(self):
    load_dotenv()

  def get(self, key: str) -> str | None:
    return environ.get(key)

config_service = Config()
