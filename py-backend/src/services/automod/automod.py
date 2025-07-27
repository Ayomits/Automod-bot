from .caps_lock import CapsLockAutomodService, CapsLockType
from .max_message_length import MaxMessageLengthAutomodSercice
from .rules import AutomodRules
from pydantic import BaseModel
from schemas import AutomodRequestSchema, AutomodResponseSchema, AutomodMatch, AutomodEntry


class AutomodRule(BaseModel):
    matched: bool
    rules: list[str]


class AutomodService:

    __capslock = CapsLockAutomodService()
    __max_message_length = MaxMessageLengthAutomodSercice()

    __automod_rules = [rule.value for rule in AutomodRules]

    def pipeline(self, schema: AutomodRequestSchema) -> AutomodResponseSchema:
        messages = schema.entries
        matches = []
        rules_to_check = schema.rules if len(
            schema.rules) >= 1 else self.__automod_rules
        for message in messages:
            if message.content:
                rules = []
                for rule in rules_to_check:
                    runned = self.run_rule(rule=rule, message=message)
                    if runned:
                        rules.append(rule)
                if len(rules) > 0:
                    matches.append(AutomodMatch(
                        user_id=message.user_id, content=message.content, rules=rules))
        return AutomodResponseSchema(matches=matches)

    def run_rule(self, rule: AutomodRules, message: AutomodEntry):
        if rule == AutomodRules.CAPS.value:
            return self.process_rule(func=self.__run_full_caps_rule, content=message.content, rule=rule)
        elif rule == AutomodRules.CAPS_MIXED.value:
            return self.process_rule(func=self.__run_mixed_caps_rule, content=message.content, rule=rule)
        elif rule == AutomodRules.MESSAGE_MAX_LENGTH.value:
            return self.process_rule(func=self.__run_max_message_length_rule, content=message.content, rule=rule)
        else:
            return False

    def process_rule(self, func, content: str, rule: AutomodRules):
        is_matched = func(content)
        return is_matched if rule else None

    def __run_full_caps_rule(self, content: str):
        return self.__capslock.analyze(content=content)

    def __run_mixed_caps_rule(self, content: str):
        return self.__capslock.analyze(content=content, type=CapsLockType.Mixed.value)

    def __run_max_message_length_rule(self, content: str):
        return self.__max_message_length.analyze(content=content)
