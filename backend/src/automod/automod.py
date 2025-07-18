from . import CapsLock, CapsLockType
from .rules import AutomodRules
from pydantic import BaseModel
from schemas import AutomodRequestSchema, AutomodResponseSchema, AutomodMatch, AutomodMessage

class AutomodRule(BaseModel):
    matched: bool
    rules: list[str]

class Automod:

    __capslock = CapsLock()
    __automod_rules = [rule.value for rule in AutomodRules]

    def pipeline(self, schema: AutomodRequestSchema) -> AutomodResponseSchema:
        messages = schema.messages
        matches = []
        for message in messages:
            if message.content:
                rules = []
                for rule in self.__automod_rules:
                    runned = self.run_rule(rule=rule, message=message)
                    if runned:
                        rules.append(rule)
                if len(rules) > 0:
                    matches.append(AutomodMatch(user_id=message.user_id, content=message.content, rules=rules))
        return AutomodResponseSchema(matches=matches)

    def run_rule(self, rule: AutomodRules, message: AutomodMessage):
        if rule == AutomodRules.CAPS.value:
            return self.process_rule(func=self.__run_full_caps_rule, content=message.content, rule=rule)
        elif rule == AutomodRules.CAPS_MIXED.value:
            return self.process_rule(func=self.__run_mixed_caps_rule, content=message.content, rule=rule)
        else:
            return False

    def process_rule(self, func, content: str, rule: AutomodRules):
        is_matched = func(content)
        return is_matched if rule else None

    def __run_full_caps_rule(self, content: str):
        return self.__capslock.analyze(content=content)

    def __run_mixed_caps_rule(self, content: str):
        return self.__capslock.analyze(content=content, type=CapsLockType.Mixed.value)
