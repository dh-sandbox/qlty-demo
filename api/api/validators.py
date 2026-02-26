"""Validation utilities for the qlty-demo API."""

import re


def validate_email(email: str) -> tuple[bool, list[str]]:
    """Validate an email address format.

    Returns a tuple of (is_valid, list_of_errors).
    """
    errors: list[str] = []

    if not email or not email.strip():
        errors.append("Email address is required.")
        return False, errors

    email = email.strip()

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        errors.append("Invalid email format.")

    if len(email) > 254:
        errors.append("Email address is too long (max 254 characters).")

    local_part = email.split("@")[0] if "@" in email else email
    if len(local_part) > 64:
        errors.append("Local part of email is too long (max 64 characters).")

    valid = len(errors) == 0
    return valid, errors


def validate_password(password: str) -> tuple[bool, list[str]]:
    """Validate password strength.

    Checks for minimum length, uppercase, lowercase, digit, and special character.
    Returns a tuple of (is_valid, list_of_errors).
    """
    errors: list[str] = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")

    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")

    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter.")

    if not re.search(r"[0-9]", password):
        errors.append("Password must contain at least one digit.")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        errors.append("Password must contain at least one special character.")

    valid = len(errors) == 0
    return valid, errors


def validate_username(username: str) -> tuple[bool, list[str]]:
    """Validate a username.

    Must be 3-30 characters, alphanumeric plus underscores, and not start with a number.
    Returns a tuple of (is_valid, list_of_errors).
    """
    errors: list[str] = []

    if not username or not username.strip():
        errors.append("Username is required.")
        return False, errors

    username = username.strip()

    if len(username) < 3:
        errors.append("Username must be at least 3 characters long.")

    if len(username) > 30:
        errors.append("Username must be at most 30 characters long.")

    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        errors.append("Username may only contain letters, digits, and underscores.")

    if username[0].isdigit():
        errors.append("Username must not start with a number.")

    valid = len(errors) == 0
    return valid, errors


def sanitize_input(text: str) -> str:
    """Sanitize user input by stripping HTML tags, trimming whitespace,
    and collapsing multiple spaces into one.
    """
    cleaned = re.sub(r"<[^>]*>", "", text)
    cleaned = cleaned.strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned
