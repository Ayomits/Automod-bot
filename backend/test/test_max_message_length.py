import pytest
from src.automod import MaxMessageLength, MaxMessageLengthOptions, MaxMessageTrigger

@pytest.fixture()
def max_message_length_instance():
    return MaxMessageLength(options=MaxMessageLengthOptions(20))

def test_failure_boolean_check(max_message_length_instance):
    assert max_message_length_instance.analyze(text="Привет мир") is False

def test_success_boolean_check(max_message_length_instance):
    assert max_message_length_instance.analyze(text="Привет мир и вся наша большая семья, планеа и мама") is True

def test_failure_boolean_check(max_message_length_instance):
    text="Привет мир"
    assert max_message_length_instance.analyze(text=text) is MaxMessageTrigger(raw=text, sliced=text, matched=False)

def test_success_boolean_check(max_message_length_instance):
    text="Привет мир и вся наша большая семья, планеа и мама"
    assert max_message_length_instance.analyze(text=text) is MaxMessageTrigger(text=text, raw=text[slice(0, 20)], matched=True)
