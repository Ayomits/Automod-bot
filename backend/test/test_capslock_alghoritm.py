import pytest
from src import automod

@pytest.fixture
def caps_lock_instance():
    return automod.CapsLock()

def test_full_caps(caps_lock_instance):
    assert caps_lock_instance.analyze("ПРИВЕТ ВСЕМ РАБОТЯЩИМ") is True

def test_full_caps(caps_lock_instance):
    assert caps_lock_instance.analyze("Привет всем работящим") is False

def test_mixed_caps(caps_lock_instance):
    assert caps_lock_instance.analyze("ПрИвЕт вСеМ рАБотящим", type=automod.CapsLockType.Mixed.value) is True

def test_mixed_caps(caps_lock_instance):
    assert caps_lock_instance.analyze("ПрИвЕт всем работящим", type=automod.CapsLockType.Mixed.value) is False
