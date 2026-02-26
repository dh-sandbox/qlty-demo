"""FastAPI application for the qlty-demo API."""

from datetime import datetime

from fastapi import FastAPI, HTTPException

from api.models import EmailRequest, PasswordRequest, User, ValidationResult
from api.validators import validate_email, validate_password

app = FastAPI(
    title="qlty-demo-api",
    description="Demo API backend for Qlty code quality tools",
    version="0.1.0",
)


@app.get("/")
async def root() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "service": "qlty-demo-api"}


@app.post("/validate/email", response_model=ValidationResult)
async def validate_email_endpoint(request: EmailRequest) -> ValidationResult:
    """Validate an email address format."""
    valid, errors = validate_email(request.email)
    return ValidationResult(valid=valid, errors=errors)


@app.post("/validate/password", response_model=ValidationResult)
async def validate_password_endpoint(request: PasswordRequest) -> ValidationResult:
    """Validate password strength."""
    valid, errors = validate_password(request.password)
    return ValidationResult(valid=valid, errors=errors)


MOCK_USERS: dict[int, User] = {
    1: User(
        id=1,
        username="alice",
        email="alice@example.com",
        created_at=datetime(2025, 1, 15, 10, 30, 0),
        is_active=True,
    ),
    2: User(
        id=2,
        username="bob",
        email="bob@example.com",
        created_at=datetime(2025, 3, 22, 14, 0, 0),
        is_active=False,
    ),
}


@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int) -> User:
    """Retrieve a mock user by ID."""
    if user_id not in MOCK_USERS:
        raise HTTPException(status_code=404, detail="User not found")
    return MOCK_USERS[user_id]
