from regex import findall
from pydantic import BaseModel, NonNegativeInt
from enum import Enum
from .regex import MessageCleanUp

class CapsLockOptions(BaseModel):
    """Для обычного капс лока"""
    default_trigger_percentage: NonNegativeInt

    mixed_word_trigger_percentage: NonNegativeInt
    mixed_words_trigger_percentage: NonNegativeInt

default_options = CapsLockOptions(mixed_word_trigger_percentage=20, mixed_words_trigger_percentage=50, default_trigger_percentage=55)

class CapslockMatch(BaseModel):
    word: str
    is_potential: bool

class CapsLockType(Enum):
    Default = "default"
    Mixed = "mixed"

class CapsLock:
    __options: CapsLockOptions

    def __init__(self, options: CapsLockOptions = default_options):
        self.__options=default_options.copy(update=options.dict())

    def analyze(self, content: str, type: CapsLockType = CapsLockType.Default.value) -> bool:
        all_caps_symbols = MessageCleanUp.caps_symbols(content=content, return_string=True)
        all_symbols = MessageCleanUp.clean_up(content=content, return_string=True)

        all_caps_length = len(all_caps_symbols)
        all_symbols_length = len(all_symbols) if len(all_symbols) != 0 else 1

        caps_percent = round(all_caps_length / all_symbols_length * 100)

        is_potential_abbreviation = caps_percent == 100 and len(all_caps_symbols) <= 5 and len(all_symbols) <= 1

        """Проверка дефолтного правила капса"""
        if type == CapsLockType.Default.value:
            return caps_percent >= self.__options.default_trigger_percentage and not is_potential_abbreviation
        """Проверка на сЛоЖнЫй кАпС"""
        if type == CapsLockType.Mixed.value:
            mapped_words = [self.__filter_mixed_words(i, word, all_symbols) for i, word in enumerate(all_symbols)]
            filtred_words = list(filter(lambda w: w.is_potential, mapped_words))
            percantage = round(len(filtred_words) / all_symbols_length * 100)
            return percantage >= self.__options.mixed_words_trigger_percentage

    def __filter_mixed_words(self, i: int, word: str, self_arr: list[str], once = False) -> bool:
        all_symbols = MessageCleanUp.clean_up(content=word)
        all_caps_symbols = MessageCleanUp.caps_symbols(content=word)
        all_caps_length = len(all_caps_symbols)
        all_symbols_length = len(all_symbols) if len(all_symbols) != 0 else 1

        if all_caps_length <= 1:
            return CapslockMatch(word=word, is_potential=False)

        prev_word = self_arr[i-1] if i > 0 else None
        next_word = self_arr[i+1] if i < len(self_arr) - 1 else None

        word_percentage = round(all_caps_length / all_symbols_length * 100)

        is_potential_abbreviation = word_percentage == 100 and len(all_caps_symbols) <= 5
        is_potential_trigger = word_percentage >= self.__options.mixed_word_trigger_percentage and not is_potential_abbreviation

        if once:
            return is_potential_trigger

        is_prev = self.__filter_mixed_words(i=i-1, word=prev_word, self_arr=self_arr, once=True) if prev_word else False
        is_next = self.__filter_mixed_words(i=i+1, word=next_word, self_arr=self_arr, once=True) if next_word else False

        is_potential_caps = is_prev or is_next

        return CapslockMatch(word=word, is_potential=is_potential_trigger or is_potential_caps and not is_potential_abbreviation)
