from ml import ml_service
from .message_clean_up import MessageCleanUpService

class ToxicityService:
  def analyze(self, content: str):
    cleaned_message = MessageCleanUpService.clean_up(content=content, return_string=True)
    ml_analyze = ml_service.predict_toxicity(content=cleaned_message.lower())
    return ml_analyze <= 0.065
