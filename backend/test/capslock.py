import pytest
from src import automod

@pytest.fixture
def caps_lock_instance():
    return automod.CapsLock()

def test_full_capslock(caps_lock_instance):
    assert caps_lock_instance.moderate("ПРИВЕТ ВСЕМ РАБОТЯГАМ", automod.CapsLockType.Default) is True

def test_part_capslock(caps_lock_instance):
    assert caps_lock_instance.moderate("ПРИВЕТ всем работягам", automod.CapsLockType.Default) is False

def test_trigger_capslock(caps_lock_instance):
    assert caps_lock_instance.moderate("ПРИВЕТ ВСЕМ работягам", automod.CapsLockType.Default) is False
