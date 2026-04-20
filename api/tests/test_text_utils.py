"""Tests for text processing utilities."""

import pytest

from api.text_utils import camel_to_snake, slugify, truncate, word_wrap


# ---------------------------------------------------------------------------
# slugify
# ---------------------------------------------------------------------------


class TestSlugify:
    """Tests for the slugify function."""

    def test_simple_string(self) -> None:
        assert slugify("Hello World") == "hello-world"

    def test_special_characters(self) -> None:
        assert slugify("Hello, World!") == "hello-world"

    def test_unicode_normalization(self) -> None:
        assert slugify("Héllo Wörld") == "hello-world"

    def test_consecutive_spaces(self) -> None:
        assert slugify("  multiple   spaces  ") == "multiple-spaces"

    def test_empty_string(self) -> None:
        assert slugify("") == ""

    def test_underscores(self) -> None:
        assert slugify("snake_case_string") == "snake_case_string"


# ---------------------------------------------------------------------------
# truncate
# ---------------------------------------------------------------------------


class TestTruncate:
    """Tests for the truncate function."""

    def test_short_string_unchanged(self) -> None:
        assert truncate("short", 10) == "short"

    def test_truncates_with_default_suffix(self) -> None:
        assert truncate("This is a long string", 10) == "This is..."

    def test_custom_suffix(self) -> None:
        assert truncate("This is a long string", 12, "~") == "This is a l~"

    def test_exact_length_unchanged(self) -> None:
        assert truncate("exact", 5) == "exact"

    def test_raises_when_max_length_too_small(self) -> None:
        with pytest.raises(ValueError, match="at least as long"):
            truncate("hello", 2)


# ---------------------------------------------------------------------------
# word_wrap
# ---------------------------------------------------------------------------


class TestWordWrap:
    """Tests for the word_wrap function."""

    def test_wraps_at_word_boundary(self) -> None:
        result = word_wrap("one two three four", width=10)
        assert result == "one two\nthree four"

    def test_preserves_existing_newlines(self) -> None:
        result = word_wrap("hello\nworld", width=80)
        assert result == "hello\nworld"

    def test_empty_string(self) -> None:
        assert word_wrap("") == ""

    def test_single_long_word(self) -> None:
        assert word_wrap("superlongword", width=5) == "superlongword"

    def test_raises_for_zero_width(self) -> None:
        with pytest.raises(ValueError, match="at least 1"):
            word_wrap("text", width=0)


# ---------------------------------------------------------------------------
# camel_to_snake
# ---------------------------------------------------------------------------


class TestCamelToSnake:
    """Tests for the camel_to_snake function."""

    def test_simple_camel_case(self) -> None:
        assert camel_to_snake("camelCase") == "camel_case"

    def test_pascal_case(self) -> None:
        assert camel_to_snake("PascalCase") == "pascal_case"

    def test_consecutive_uppercase(self) -> None:
        assert camel_to_snake("parseHTMLString") == "parse_html_string"

    def test_already_snake_case(self) -> None:
        assert camel_to_snake("already_snake") == "already_snake"

    def test_single_word(self) -> None:
        assert camel_to_snake("lowercase") == "lowercase"
