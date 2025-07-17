from regex import findall
from pydantic import BaseModel, NonNegativeInt

class CapsLockType():
    Default = "default"
    Mixed = "mixed"

class CapsLockOptions(BaseModel):
    """Для обычного капс лока"""
    default_trigger_percentage: NonNegativeInt

    """Какой процент слова должен быть написан по-уродски"""
    mixed_word_trigger_percentage: NonNegativeInt
    """Какой процент слов должен быть написан по-уродски"""
    mixed_words_trigger_percentage: NonNegativeInt

default_options = CapsLockOptions(mixed_word_trigger_percentage=20, mixed_words_trigger_percentage=50, default_trigger_percentage=80)

class CapsLock:
    __options: CapsLockOptions

    def __init__(self, options: CapsLockOptions = default_options):
        self.__options = options

    def moderate(self, content: str, type: CapsLockType = CapsLockType.Default) -> bool:
        if type == CapsLockType.Default:
            return self.__default_caps(content=content)
        else:
            return self.__mixed_caps(content=content)

    def __find_all_uppercase(self, content: str) -> str:
        return findall(r'[A-Z]+', content)

    def __default_caps(self, content: str) -> bool:
        raw_text_length = len(content)
        all_caps_length = len("".join(self.__find_all_uppercase(content=content)))
        caps_percent = round(all_caps_length / raw_text_length * 100)
        return caps_percent > self.__options.default_trigger_percentage

    def __mixed_caps(self, content: str) -> bool:
        words = content.split(" ")
        words_filtred = list(filter(self.__mixed_caps_filter, words))
        percantage = round(len(words_filtred) / len(words) * 100)
        print(percantage)
        return percantage > self.__options.mixed_words_trigger_percentage

    def __mixed_caps_filter(self, word: str) -> str:
        uppercase_symbols = self.__find_all_uppercase(content=word)
        uppercase_symbols_length = len(uppercase_symbols)
        raw_length = len(word)
        percentage = round(uppercase_symbols_length / raw_length * 100)

        if percentage == 0:
            return False

        return percentage > self.__options.mixed_word_trigger_percentage
