from torch import no_grad, sigmoid, cuda
from transformers import AutoModelForSequenceClassification, AutoTokenizer

class ToxicityML:
    __tokenizer = None
    __model = None

    def __init__(self):
        model_checkpoint = 'cointegrated/rubert-tiny-toxicity'
        self.__tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)
        self.__model = AutoModelForSequenceClassification.from_pretrained(model_checkpoint)
        if cuda.is_available():
            self.__model.cuda()

    def predict_toxicity(self, text: str, aggregate=True):
        with no_grad():
            inputs = self.__tokenizer(text, return_tensors='pt', truncation=True, padding=True).to(self.__model.device)
            proba = sigmoid(self.__model(**inputs).logits).cpu().numpy()
        if isinstance(text, str):
            proba = proba[0]
        if aggregate:
            return 1 - proba.T[0] * (1 - proba.T[-1])
        return proba

toxicity_ml = ToxicityML()
