from ml import toxicity_ml

class Toxicity:
  def analyze(self, content: str):
    ml_analyze = toxicity_ml.predict_toxicity(text="".join(content.lower().split()))
    return ml_analyze <= 0.065
