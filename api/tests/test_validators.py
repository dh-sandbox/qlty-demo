"""Tests for validation utilities."""

import pytest

from api.validators import (
    sanitize_input,
    validate_email,
    validate_password,
    validate_username,
)


# ---------------------------------------------------------------------------
# validate_email
# ---------------------------------------------------------------------------

class TestValidateEmail:
    """Tests for the validate_email function."""

    def test_valid_simple_email(self) -> None:
        valid, errors = validate_email("user@example.com")
        assert valid is True
        assert errors == []

    def test_valid_email_with_dots(self) -> None:
        valid, errors = validate_email("first.last@example.com")
        assert valid is True
        assert errors == []

    def test_valid_email_with_plus(self) -> None:
        valid, errors = validate_email("user+tag@example.com")
        assert valid is True
        assert errors == []

    def test_valid_email_with_subdomain(self) -> None:
        valid, errors = validate_email("user@mail.example.co.uk")
        assert valid is True
        assert errors == []

    def test_invalid_missing_at(self) -> None:
        valid, errors = validate_email("userexample.com")
        assert valid is False
        assert "Invalid email format." in errors

    def test_invalid_missing_domain(self) -> None:
        valid, errors = validate_email("user@")
        assert valid is False
        assert "Invalid email format." in errors

    def test_invalid_missing_tld(self) -> None:
        valid, errors = validate_email("user@example")
        assert valid is False
        assert "Invalid email format." in errors

    def test_empty_string(self) -> None:
        valid, errors = validate_email("")
        assert valid is False
        assert "Email address is required." in errors

    def test_whitespace_only(self) -> None:
        valid, errors = validate_email("   ")
        assert valid is False
        assert "Email address is required." in errors

    def test_email_with_leading_trailing_spaces(self) -> None:
        valid, errors = validate_email("  user@example.com  ")
        assert valid is True
        assert errors == []

    def test_email_too_long(self) -> None:
        local = "a" * 64
        domain = "b" * 186 + ".com"
        email = f"{local}@{domain}"
        valid, errors = validate_email(email)
        assert valid is False
        assert "Email address is too long (max 254 characters)." in errors

    def test_local_part_too_long(self) -> None:
        local = "a" * 65
        email = f"{local}@example.com"
        valid, errors = validate_email(email)
        assert valid is False
        assert "Local part of email is too long (max 64 characters)." in errors


# ---------------------------------------------------------------------------
# validate_password
# ---------------------------------------------------------------------------

class TestValidatePassword:
    """Tests for the validate_password function."""

    def test_valid_strong_password(self) -> None:
        valid, errors = validate_password("Str0ng!Pass")
        assert valid is True
        assert errors == []

    def test_too_short(self) -> None:
        valid, errors = validate_password("Ab1!")
        assert valid is False
        assert "Password must be at least 8 characters long." in errors

    def test_missing_uppercase(self) -> None:
        valid, errors = validate_password("lowercase1!")
        assert valid is False
        assert "Password must contain at least one uppercase letter." in errors

    def test_missing_lowercase(self) -> None:
        valid, errors = validate_password("UPPERCASE1!")
        assert valid is False
        assert "Password must contain at least one lowercase letter." in errors

    def test_missing_digit(self) -> None:
        valid, errors = validate_password("NoDigits!Here")
        assert valid is False
        assert "Password must contain at least one digit." in errors

    def test_missing_special_char(self) -> None:
        valid, errors = validate_password("NoSpecial1Here")
        assert valid is False
        assert "Password must contain at least one special character." in errors

    def test_all_rules_violated(self) -> None:
        valid, errors = validate_password("abc")
        assert valid is False
        assert len(errors) >= 3

    def test_exactly_eight_chars_valid(self) -> None:
        valid, errors = validate_password("Abcde1!x")
        assert valid is True
        assert errors == []

    def test_empty_password(self) -> None:
        valid, errors = validate_password("")
        assert valid is False
        assert len(errors) >= 1


# ---------------------------------------------------------------------------
# validate_username
# ---------------------------------------------------------------------------

class TestValidateUsername:
    """Tests for the validate_username function."""

    def test_valid_username(self) -> None:
        valid, errors = validate_username("alice")
        assert valid is True
        assert errors == []

    def test_valid_with_underscores(self) -> None:
        valid, errors = validate_username("alice_bob")
        assert valid is True
        assert errors == []

    def test_valid_with_digits(self) -> None:
        valid, errors = validate_username("alice123")
        assert valid is True
        assert errors == []

    def test_too_short(self) -> None:
        valid, errors = validate_username("ab")
        assert valid is False
        assert "Username must be at least 3 characters long." in errors

    def test_too_long(self) -> None:
        valid, errors = validate_username("a" * 31)
        assert valid is False
        assert "Username must be at most 30 characters long." in errors

    def test_starts_with_number(self) -> None:
        valid, errors = validate_username("1alice")
        assert valid is False
        assert "Username must not start with a number." in errors

    def test_special_characters(self) -> None:
        valid, errors = validate_username("alice@bob")
        assert valid is False
        assert "Username may only contain letters, digits, and underscores." in errors

    def test_empty_string(self) -> None:
        valid, errors = validate_username("")
        assert valid is False
        assert "Username is required." in errors

    def test_whitespace_only(self) -> None:
        valid, errors = validate_username("   ")
        assert valid is False
        assert "Username is required." in errors

    def test_exactly_three_chars(self) -> None:
        valid, errors = validate_username("abc")
        assert valid is True
        assert errors == []

    def test_exactly_thirty_chars(self) -> None:
        valid, errors = validate_username("a" * 30)
        assert valid is True
        assert errors == []


# ---------------------------------------------------------------------------
# sanitize_input
# ---------------------------------------------------------------------------

class TestSanitizeInput:
    """Tests for the sanitize_input function."""

    def test_strips_html_tags(self) -> None:
        assert sanitize_input("<b>bold</b>") == "bold"

    def test_strips_script_tags(self) -> None:
        assert sanitize_input('<script>alert("xss")</script>') == 'alert("xss")'

    def test_trims_whitespace(self) -> None:
        assert sanitize_input("  hello  ") == "hello"

    def test_collapses_multiple_spaces(self) -> None:
        assert sanitize_input("hello    world") == "hello world"

    def test_combined_sanitization(self) -> None:
        result = sanitize_input("  <p>hello</p>   <b>world</b>  ")
        assert result == "hello world"

    def test_empty_string(self) -> None:
        assert sanitize_input("") == ""

    def test_no_tags_passthrough(self) -> None:
        assert sanitize_input("clean text") == "clean text"

    def test_nested_tags(self) -> None:
        assert sanitize_input("<div><span>inner</span></div>") == "inner"
