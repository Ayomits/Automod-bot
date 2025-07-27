from pydantic import BaseModel
from .message_clean_up import MessageCleanUpService

class MaxMessageLengthOptions(BaseModel):
    max_message_length: int
    max_word_length: int

class MaxMessageTrigger(BaseModel):
    raw: str
    sliced: str
    matched: bool

default_options = MaxMessageLengthOptions(max_message_length=256, max_word_length=32)

class MaxMessageLengthAutomodSercice:
    __options: MaxMessageLengthOptions

    def __init__(self, options: MaxMessageLengthOptions = default_options):
        self.__options = default_options.copy(update=options.dict())

    def analyze(self, content: str, return_raw = False):
        sliced_message = content[slice(0, self.__options.max_message_length)]
        ## TODO: move to service
        splited_message = MessageCleanUpService.clean_up(content=content, return_string=True)
        is_max_message_matched = len(content) > self.__options.max_message_length
        if is_max_message_matched:
            if return_raw:
                return MaxMessageTrigger(raw=content, sliced=sliced_message, matched=True)
            return True
        for word in splited_message:
            if len(word) > self.__options.max_word_length:
                return True
        return False
