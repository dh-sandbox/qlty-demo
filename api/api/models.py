"""Pydantic models for the qlty-demo API."""

from datetime import datetime

from pydantic import BaseModel, Field


class User(BaseModel):
    """Represents a user in the system."""

    id: int
    username: str
    email: str
    created_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = True


class EmailRequest(BaseModel):
    """Request body for email validation."""

    email: str


class PasswordRequest(BaseModel):
    """Request body for password validation."""

    password: str


class ValidationResult(BaseModel):
    """Result of a validation check."""

    valid: bool
    errors: list[str] = Field(default_factory=list)


class UserCreateRequest(BaseModel):
    """Request body for creating a new user."""

    username: str = Field(min_length=3, max_length=30)
    email: str
    password: str = Field(min_length=8)
