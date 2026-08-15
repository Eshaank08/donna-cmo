#!/usr/bin/env python3
"""Thin CLI wrapper around run_scan() that prints one JSON object to stdout.
Used by the app's job runner and MCP server - human-facing use should go
through find_opportunities.py directly instead."""

import argparse
import json
import sys
from pathlib import Path

from find_opportunities import run_scan


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, required=True)
    parser.add_argument("--seen-path", type=Path, required=True)
    parser.add_argument("--hours", type=float, default=None)
    parser.add_argument("--min-score", type=float, default=None)
    parser.add_argument("--mark-seen", action="store_true")
    args = parser.parse_args()

    result = run_scan(
        config_path=args.config,
        seen_path=args.seen_path,
        hours=args.hours,
        min_score=args.min_score,
        mark_seen=args.mark_seen,
    )
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
