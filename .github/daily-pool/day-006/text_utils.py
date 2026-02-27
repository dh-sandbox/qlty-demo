"""Text processing utilities."""

import re
import unicodedata


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug.

    Normalizes unicode, lowercases, replaces non-alphanumeric characters with
    hyphens, and collapses consecutive hyphens.
    """
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    lowered = ascii_text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", lowered)
    slug = re.sub(r"[-\s]+", "-", slug)
    return slug.strip("-")


def truncate(text: str, max_length: int, suffix: str = "...") -> str:
    """Truncate text to a maximum length, appending a suffix if truncated."""
    if max_length < len(suffix):
        raise ValueError("max_length must be at least as long as the suffix.")
    if len(text) <= max_length:
        return text
    return text[: max_length - len(suffix)] + suffix


def word_wrap(text: str, width: int = 80) -> str:
    """Wrap text at word boundaries to the given width.

    Preserves existing newlines and does not break words.
    """
    if width < 1:
        raise ValueError("Width must be at least 1.")

    lines: list[str] = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue

        current_line = words[0]
        for word in words[1:]:
            if len(current_line) + 1 + len(word) <= width:
                current_line += " " + word
            else:
                lines.append(current_line)
                current_line = word
        lines.append(current_line)

    return "\n".join(lines)


def camel_to_snake(name: str) -> str:
    """Convert a camelCase or PascalCase string to snake_case."""
    result = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", name)
    result = re.sub(r"([a-z\d])([A-Z])", r"\1_\2", result)
    return result.lower()
