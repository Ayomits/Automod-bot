from torch import no_grad, sigmoid
from transformers import BertTokenizer, BertForSequenceClassification

class RussianToxicityML:
    __tokenizer = None
    __model = None

    def __init__(self):
        model_checkpoint = 's-nlp/russian_toxicity_classifier'
        self.__tokenizer = BertTokenizer.from_pretrained(model_checkpoint)
        self.__model = BertForSequenceClassification.from_pretrained(model_checkpoint)

    def predict_toxicity(self, text: str) -> float:
        batch = self.__tokenizer.encode(text, return_tensors='pt')
        with no_grad():
            logits = self.__model(batch).logits
            proba = sigmoid(logits).cpu().numpy()[0][0]
        return float(proba)
