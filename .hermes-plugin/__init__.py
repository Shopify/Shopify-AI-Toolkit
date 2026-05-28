"""Shopify AI Toolkit — Hermes plugin.

Auto-registers every skill under ../skills/ as a Hermes skill and exposes
a `hermes shopify` CLI subcommand that proxies to the Shopify CLI on $PATH.

Skills live alongside this manifest at the repo root (`skills/`), shared
with the Claude, Cursor, Codex, and Gemini client manifests. Hermes loads
them on demand via:

    skill_view("shopify-plugin:<skill-name>")
"""

from __future__ import annotations

import argparse
import logging
import os
import shutil
import subprocess
import sys
from pathlib import Path

logger = logging.getLogger(__name__)

# The plugin folder is `.hermes-plugin/`, which sits next to `skills/` in
# the Shopify-AI-Toolkit repo. install.sh symlinks .hermes-plugin/ into
# ~/.hermes/plugins/, so resolve() before walking up — otherwise the
# parent is the symlink directory (~/.hermes/plugins) and skills/ is missing.
_PLUGIN_DIR = Path(__file__).resolve().parent
_SKILLS_DIR = _PLUGIN_DIR.parent / "skills"
_SHOPIFY_BIN_ENV = "HERMES_SHOPIFY_BIN"


def _discover_skills() -> list[tuple[str, Path]]:
    """Return (skill_name, SKILL.md path) for every shared skill."""
    if not _SKILLS_DIR.is_dir():
        logger.warning("skills/ directory missing at %s", _SKILLS_DIR)
        return []

    found: list[tuple[str, Path]] = []
    for child in sorted(_SKILLS_DIR.iterdir()):
        if not child.is_dir():
            continue
        skill_md = child / "SKILL.md"
        if skill_md.is_file():
            found.append((child.name, skill_md))
        else:
            logger.debug("Skipping %s — no SKILL.md", child.name)
    return found


def _resolve_shopify_bin() -> str | None:
    """Find the Shopify CLI binary. Env var wins, otherwise search $PATH."""
    override = os.environ.get(_SHOPIFY_BIN_ENV)
    if override:
        return override if Path(override).is_file() else None
    return shutil.which("shopify")


def _setup_shopify_argparse(subparser) -> None:
    """Configure the `hermes shopify` subcommand to forward arguments verbatim."""
    subparser.add_argument(
        "args",
        nargs=argparse.REMAINDER,
        help="Arguments forwarded to the shopify CLI (run `hermes shopify --help` for upstream help).",
    )


def _shopify_passthrough(args) -> int:
    """Shell out to the Shopify CLI with whatever arguments came in."""
    binary = _resolve_shopify_bin()
    if not binary:
        sys.stderr.write(
            "shopify CLI not found on PATH. Install it with `npm install -g @shopify/cli`,\n"
            f"or set ${_SHOPIFY_BIN_ENV} to an absolute path.\n"
        )
        return 127

    forwarded = list(getattr(args, "args", []) or [])
    try:
        completed = subprocess.run([binary, *forwarded], check=False)
        return completed.returncode
    except KeyboardInterrupt:
        return 130
    except Exception as exc:  # passthrough must never raise
        sys.stderr.write(f"shopify passthrough failed: {exc}\n")
        return 1


def register(ctx) -> None:
    """Hermes entry point. Called once at startup."""
    skills = _discover_skills()
    for skill_name, skill_md in skills:
        ctx.register_skill(skill_name, skill_md)
    logger.info("shopify-plugin: registered %d skills", len(skills))

    ctx.register_cli_command(
        name="shopify",
        help="Run the Shopify CLI from inside Hermes (passthrough).",
        setup_fn=_setup_shopify_argparse,
        handler_fn=_shopify_passthrough,
    )
