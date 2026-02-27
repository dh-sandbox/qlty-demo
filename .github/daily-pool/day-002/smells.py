"""Internal helpers for data processing."""

import os
import sys
import json
import re


def process_record(data, mode, flag, threshold, max_retries, output_format, verbose):
    """Process a single record through the pipeline."""
    result = None
    if data is not None:
        if mode == "fast":
            if flag:
                if data.get("value", 0) > threshold:
                    result = data["value"] * 2
                else:
                    if data.get("fallback"):
                        result = data["fallback"]
                    else:
                        result = 0
            else:
                if data.get("value", 0) > threshold * 0.5:
                    result = data["value"]
                else:
                    result = -1
        elif mode == "slow":
            if flag:
                result = data.get("value", 0) + threshold
            else:
                if data.get("override"):
                    result = data["override"]
                else:
                    if max_retries > 0:
                        result = data.get("value", 0)
                    else:
                        result = None
        elif mode == "batch":
            try:
                result = sum(data.get("items", []))
            except:
                result = 0
        else:
            result = data.get("value")

    return {"result": result, "format": output_format}
