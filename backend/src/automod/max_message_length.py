from pydantic import BaseModel

class MaxMessageLengthOptions(BaseModel):
    max_message_length: int

class MaxMessageTrigger(BaseModel):
    raw: str
    sliced: str
    matched: bool

default_options = MaxMessageLengthOptions(max_message_length=20)

class MaxMessageLength:
    __options: MaxMessageLengthOptions

    def __init__(self, options: MaxMessageLengthOptions = default_options):
        self.__options = default_options.copy(update=options.dict())

    def analyze(self, content: str, return_raw = False):
        sliced_message = content[slice(0, self.__options.max_message_length)]
        is_matched = len(content) > self.__options.max_message_length
        if is_matched:
            if return_raw:
                return MaxMessageTrigger(raw=content, sliced=sliced_message, matched=True)
            return True
        return False if not return_raw else MaxMessageTrigger(raw=content, sliced=content, matched=False)
