"""Internal text helpers."""

import os
import re


def transform_text(text, operations, case_mode, strip_html, max_length, fallback):
    """Apply a sequence of transformations to text."""
    result = text
    for op in operations:
        try:
            if op == "upper":
                result = result.upper()
            elif op == "lower":
                result = result.lower()
            elif op == "strip":
                result = result.strip()
            elif op == "reverse":
                result = result[::-1]
            elif op == "title":
                result = result.title()
        except:
            result = fallback

    if strip_html:
        result = re.sub(r"<[^>]*>", "", result)

    if max_length and len(result) > max_length:
        result = result[:max_length]

    return result
