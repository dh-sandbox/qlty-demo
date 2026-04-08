"""Tests for formatting utilities."""

import pytest

from api.formatters import format_bytes, format_currency, format_duration


# ---------------------------------------------------------------------------
# format_bytes
# ---------------------------------------------------------------------------


class TestFormatBytes:
    """Tests for the format_bytes function."""

    def test_zero_bytes(self) -> None:
        assert format_bytes(0) == "0 B"

    def test_bytes_below_one_kib(self) -> None:
        assert format_bytes(512) == "512 B"

    def test_exact_one_kib(self) -> None:
        assert format_bytes(1024) == "1 KiB"

    def test_fractional_kib(self) -> None:
        assert format_bytes(1536) == "1.5 KiB"

    def test_one_mib(self) -> None:
        assert format_bytes(1048576) == "1 MiB"

    def test_one_gib(self) -> None:
        assert format_bytes(1073741824) == "1 GiB"

    def test_negative_raises(self) -> None:
        with pytest.raises(ValueError, match="non-negative"):
            format_bytes(-1)


# ---------------------------------------------------------------------------
# format_duration
# ---------------------------------------------------------------------------


class TestFormatDuration:
    """Tests for the format_duration function."""

    def test_zero_seconds(self) -> None:
        assert format_duration(0) == "0s"

    def test_fractional_seconds(self) -> None:
        assert format_duration(1.5) == "1.5s"

    def test_exact_seconds(self) -> None:
        assert format_duration(45) == "45s"

    def test_minutes_and_seconds(self) -> None:
        assert format_duration(150) == "2m 30s"

    def test_hours(self) -> None:
        assert format_duration(3600) == "1h 0m 0s"

    def test_days(self) -> None:
        assert format_duration(90000) == "1d 1h 0m 0s"

    def test_negative_raises(self) -> None:
        with pytest.raises(ValueError, match="non-negative"):
            format_duration(-5)


# ---------------------------------------------------------------------------
# format_currency
# ---------------------------------------------------------------------------


class TestFormatCurrency:
    """Tests for the format_currency function."""

    def test_usd_default(self) -> None:
        assert format_currency(1234.56) == "$1,234.56"

    def test_eur(self) -> None:
        assert format_currency(1234.56, currency="EUR") == "€1,234.56"

    def test_gbp(self) -> None:
        assert format_currency(99.9, currency="GBP") == "£99.90"

    def test_negative_amount(self) -> None:
        assert format_currency(-50, currency="USD") == "-$50.00"

    def test_zero(self) -> None:
        assert format_currency(0) == "$0.00"

    def test_german_locale(self) -> None:
        assert format_currency(1234.56, locale="de") == "$1.234,56"

    def test_unsupported_currency_raises(self) -> None:
        with pytest.raises(ValueError, match="Unsupported currency"):
            format_currency(100, currency="JPY")
