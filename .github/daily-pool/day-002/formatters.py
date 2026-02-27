"""Formatting utilities for human-readable output."""

import math


def format_bytes(num_bytes: int) -> str:
    """Format a byte count into a human-readable string.

    Uses binary prefixes (KiB, MiB, GiB, TiB).
    """
    if num_bytes < 0:
        raise ValueError("Byte count must be non-negative.")

    if num_bytes == 0:
        return "0 B"

    units = ["B", "KiB", "MiB", "GiB", "TiB"]
    exponent = min(int(math.log(num_bytes, 1024)), len(units) - 1)
    value = num_bytes / (1024**exponent)

    if value == int(value):
        return f"{int(value)} {units[exponent]}"
    return f"{value:.1f} {units[exponent]}"


def format_duration(seconds: float) -> str:
    """Format a duration in seconds into a human-readable string.

    Examples: "1.5s", "2m 30s", "1h 15m 0s", "3d 2h 0m 0s".
    """
    if seconds < 0:
        raise ValueError("Duration must be non-negative.")

    if seconds < 60:
        return f"{seconds:.1f}s" if seconds != int(seconds) else f"{int(seconds)}s"

    total_seconds = int(seconds)
    days, remainder = divmod(total_seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, secs = divmod(remainder, 60)

    parts: list[str] = []
    if days > 0:
        parts.append(f"{days}d")
    if days > 0 or hours > 0:
        parts.append(f"{hours}h")
    parts.append(f"{minutes}m")
    parts.append(f"{secs}s")

    return " ".join(parts)


def format_currency(amount: float, currency: str = "USD", locale: str = "en") -> str:
    """Format a monetary amount with currency symbol.

    Supports USD, EUR, and GBP. Locale controls decimal/thousand separators.
    """
    symbols = {"USD": "$", "EUR": "€", "GBP": "£"}
    symbol = symbols.get(currency.upper())
    if symbol is None:
        raise ValueError(f"Unsupported currency: {currency}")

    if locale == "en":
        formatted = f"{abs(amount):,.2f}"
    elif locale == "de":
        raw = f"{abs(amount):,.2f}"
        formatted = raw.replace(",", "X").replace(".", ",").replace("X", ".")
    else:
        formatted = f"{abs(amount):,.2f}"

    prefix = "-" if amount < 0 else ""
    return f"{prefix}{symbol}{formatted}"
