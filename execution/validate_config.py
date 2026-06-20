"""
Config Validation Engine
─────────────────────────
Validates all config/*.json files against their JSON Schemas in config/schemas/.
Outputs a standardized JSON result block. Exit code 1 on any violation.

Usage:
  python execution/validate_config.py            # Validate all configs
  python execution/validate_config.py --config schedule.json
"""

import os
import sys
import json
import argparse

BASE_DIR    = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CONFIG_DIR  = os.path.join(BASE_DIR, "config")
SCHEMA_DIR  = os.path.join(CONFIG_DIR, "schemas")

# Map each config file to its schema
CONFIG_MAP = {
    "schedule.json":         "schedule.schema.json",
    "memory_config.json":    "memory_config.schema.json",
    "profiles.json":         "profiles.schema.json",
    "hardware_profile.json": "hardware_profile.schema.json",
}


def _validate_one(config_name: str, schema_name: str) -> dict:
    """Validate a single config file against its schema. Returns a result dict."""
    config_path = os.path.join(CONFIG_DIR, config_name)
    schema_path = os.path.join(SCHEMA_DIR, schema_name)

    if not os.path.exists(config_path):
        return {"file": config_name, "status": "SKIP", "errors": ["File not found"]}
    if not os.path.exists(schema_path):
        return {"file": config_name, "status": "SKIP", "errors": ["Schema not found"]}

    try:
        with open(config_path,  "r", encoding="utf-8") as f:
            config_data = json.load(f)
    except json.JSONDecodeError as e:
        return {"file": config_name, "status": "FAIL", "errors": [f"JSON parse error: {e}"]}

    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            schema_data = json.load(f)
    except json.JSONDecodeError as e:
        return {"file": config_name, "status": "FAIL", "errors": [f"Schema parse error: {e}"]}

    # Try jsonschema first, fall back to a lightweight manual check
    errors = []
    try:
        import jsonschema
        validator = jsonschema.Draft7Validator(schema_data)
        for error in sorted(validator.iter_errors(config_data), key=lambda e: list(e.path)):
            path = " → ".join(str(p) for p in error.path) or "(root)"
            errors.append(f"{path}: {error.message}")
    except ImportError:
        # Lightweight fallback: just check required keys at top level
        required = schema_data.get("required", [])
        for key in required:
            if key not in config_data:
                errors.append(f"Missing required key: '{key}'")

    if errors:
        return {"file": config_name, "status": "FAIL", "errors": errors}
    return {"file": config_name, "status": "PASS", "errors": []}


def validate_all(target: str = None) -> list[dict]:
    configs = CONFIG_MAP if target is None else {target: CONFIG_MAP[target]}
    return [_validate_one(cfg, schema) for cfg, schema in configs.items()]


def main():
    parser = argparse.ArgumentParser(description="Master-AG Config Validation Engine")
    parser.add_argument("--config", help="Validate a single config file (e.g. schedule.json)")
    parser.add_argument("--quiet",  action="store_true", help="Only print failures")
    args = parser.parse_args()

    results = validate_all(target=args.config)

    any_fail = False
    for r in results:
        if r["status"] == "FAIL":
            any_fail = True
        if args.quiet and r["status"] == "PASS":
            continue
        print(json.dumps(r))

    # Final summary line — standard contract format
    summary = {
        "status": "fail" if any_fail else "ok",
        "data": {
            "total":  len(results),
            "passed": sum(1 for r in results if r["status"] == "PASS"),
            "failed": sum(1 for r in results if r["status"] == "FAIL"),
            "skipped": sum(1 for r in results if r["status"] == "SKIP"),
        }
    }
    print(json.dumps(summary))
    sys.exit(1 if any_fail else 0)


if __name__ == "__main__":
    main()
