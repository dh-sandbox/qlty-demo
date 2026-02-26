"""Tests for Pydantic models."""

from datetime import datetime

import pytest
from pydantic import ValidationError

from api.models import (
    EmailRequest,
    PasswordRequest,
    User,
    UserCreateRequest,
    ValidationResult,
)


class TestUser:
    """Tests for the User model."""

    def test_create_user(self) -> None:
        user = User(id=1, username="alice", email="alice@example.com")
        assert user.id == 1
        assert user.username == "alice"
        assert user.email == "alice@example.com"
        assert user.is_active is True
        assert isinstance(user.created_at, datetime)

    def test_create_user_with_all_fields(self) -> None:
        dt = datetime(2025, 6, 1, 12, 0, 0)
        user = User(
            id=2,
            username="bob",
            email="bob@example.com",
            created_at=dt,
            is_active=False,
        )
        assert user.id == 2
        assert user.created_at == dt
        assert user.is_active is False

    def test_user_serialization(self) -> None:
        dt = datetime(2025, 6, 1, 12, 0, 0)
        user = User(id=1, username="alice", email="a@b.com", created_at=dt)
        data = user.model_dump()
        assert data["id"] == 1
        assert data["username"] == "alice"
        assert data["is_active"] is True

    def test_user_json_round_trip(self) -> None:
        dt = datetime(2025, 6, 1, 12, 0, 0)
        user = User(id=1, username="alice", email="a@b.com", created_at=dt)
        json_str = user.model_dump_json()
        restored = User.model_validate_json(json_str)
        assert restored.id == user.id
        assert restored.username == user.username


class TestEmailRequest:
    """Tests for the EmailRequest model."""

    def test_valid_email_request(self) -> None:
        req = EmailRequest(email="test@example.com")
        assert req.email == "test@example.com"

    def test_email_request_any_string(self) -> None:
        req = EmailRequest(email="not-an-email")
        assert req.email == "not-an-email"


class TestPasswordRequest:
    """Tests for the PasswordRequest model."""

    def test_valid_password_request(self) -> None:
        req = PasswordRequest(password="secret123")
        assert req.password == "secret123"


class TestValidationResult:
    """Tests for the ValidationResult model."""

    def test_valid_result(self) -> None:
        result = ValidationResult(valid=True)
        assert result.valid is True
        assert result.errors == []

    def test_invalid_result_with_errors(self) -> None:
        result = ValidationResult(valid=False, errors=["Too short", "Missing digit"])
        assert result.valid is False
        assert len(result.errors) == 2

    def test_serialization(self) -> None:
        result = ValidationResult(valid=False, errors=["Bad input"])
        data = result.model_dump()
        assert data == {"valid": False, "errors": ["Bad input"]}


class TestUserCreateRequest:
    """Tests for the UserCreateRequest model."""

    def test_valid_request(self) -> None:
        req = UserCreateRequest(
            username="alice",
            email="alice@example.com",
            password="Str0ng!Pass",
        )
        assert req.username == "alice"

    def test_username_too_short(self) -> None:
        with pytest.raises(ValidationError):
            UserCreateRequest(username="ab", email="a@b.com", password="Str0ng!Pass")

    def test_password_too_short(self) -> None:
        with pytest.raises(ValidationError):
            UserCreateRequest(username="alice", email="a@b.com", password="short")
