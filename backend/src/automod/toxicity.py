from ml import toxicity_ml

class Toxicity:
  def analyze(self, content: str):
    ml_analyze = toxicity_ml.predict_toxicity(text=content)
    return ml_analyze <= 0.039
