from ml.toxicity_service import RussianToxicityML

class MLService:
  __toxicity_service = RussianToxicityML()

  def predict_toxicity(self, content: str):
    return self.__toxicity_service.predict_toxicity(text=content)

ml_service = MLService()
