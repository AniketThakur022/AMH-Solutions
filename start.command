#!/bin/bash
# ════════════════════════════════════════════════════════════
#  AMH Solutions — one-click launcher (macOS)
#
#  Double-click this file in Finder to:
#    1. Create a local Python virtual environment (first run only)
#    2. Install Flask + Werkzeug (first run only)
#    3. Boot the backend on http://localhost:5850
#    4. Open the site in your default browser
#
#  Press Ctrl+C in this Terminal window to stop the server.
# ════════════════════════════════════════════════════════════

set -e

# Resolve script directory and cd there (so double-click from Finder works)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "═══════════════════════════════════════════════"
echo "  AMH Solutions — starting up"
echo "═══════════════════════════════════════════════"
echo ""

# ── 1. Verify Python 3 is installed ─────────────────────────
if ! command -v python3 &>/dev/null; then
  echo "✗ Python 3 is not installed on this machine."
  echo ""
  echo "  Download and install from:"
  echo "  https://www.python.org/downloads/"
  echo ""
  echo "  (Pick the latest macOS installer, run it, then re-launch this script.)"
  echo ""
  read -n 1 -s -r -p "Press any key to close this window..."
  exit 1
fi

PY_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info[0]}.{sys.version_info[1]}")')
echo "  ✓ Python $PY_VERSION detected"

# ── 2. Create venv on first run ─────────────────────────────
if [ ! -d ".venv" ]; then
  echo "  → First-time setup: creating virtual environment..."
  python3 -m venv .venv
fi

# ── 3. Activate venv ────────────────────────────────────────
# shellcheck disable=SC1091
source .venv/bin/activate

# ── 4. Install Flask + Werkzeug if missing ──────────────────
if ! python -c "import flask" &>/dev/null 2>&1; then
  echo "  → Installing Flask & Werkzeug (one-time, ~10 seconds)..."
  python -m pip install --quiet --upgrade pip 2>/dev/null || true
  python -m pip install --quiet -r requirements.txt
  echo "  ✓ Dependencies installed"
fi

# ── 5. Open the browser shortly after the server starts ────
(
  sleep 2
  if command -v open &>/dev/null; then
    open "http://localhost:5850/"
  fi
) &

# ── 6. Run the server (foreground, blocks until Ctrl+C) ────
echo ""
echo "  → Server running at: http://localhost:5850"
echo "  → Admin login:       admin@amhsolutions.com / changeme"
echo "  → Demo client:       demo@client.com / demo1234"
echo ""
echo "  Press Ctrl+C in this window to stop the server."
echo "═══════════════════════════════════════════════"
echo ""

python server.py
