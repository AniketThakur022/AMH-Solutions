@echo off
REM ════════════════════════════════════════════════════════════
REM   AMH Solutions — one-click launcher (Windows)
REM
REM   Double-click this file to:
REM     1. Create a local Python virtual environment (first run only)
REM     2. Install Flask + Werkzeug (first run only)
REM     3. Boot the backend on http://localhost:5850
REM     4. Open the site in your default browser
REM
REM   Close this Command Prompt to stop the server.
REM ════════════════════════════════════════════════════════════

cd /d "%~dp0"

echo.
echo ===============================================
echo   AMH Solutions - starting up
echo ===============================================
echo.

REM ── 1. Verify Python is installed ───────────────────────────
where python >nul 2>nul
if errorlevel 1 (
  echo X Python is not installed on this machine.
  echo.
  echo   Download and install from:
  echo   https://www.python.org/downloads/
  echo.
  echo   IMPORTANT: tick "Add python.exe to PATH" during install.
  echo.
  pause
  exit /b 1
)

echo   [ok] Python detected

REM ── 2. Create venv on first run ─────────────────────────────
if not exist ".venv" (
  echo   -^> First-time setup: creating virtual environment...
  python -m venv .venv
)

REM ── 3. Activate venv ────────────────────────────────────────
call .venv\Scripts\activate.bat

REM ── 4. Install Flask + Werkzeug if missing ──────────────────
python -c "import flask" >nul 2>nul
if errorlevel 1 (
  echo   -^> Installing Flask ^& Werkzeug (one-time, ~10 seconds)...
  python -m pip install --quiet --upgrade pip
  python -m pip install --quiet -r requirements.txt
  echo   [ok] Dependencies installed
)

REM ── 5. Open browser after a short delay ─────────────────────
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5850/"

REM ── 6. Run the server (foreground) ──────────────────────────
echo.
echo   -^> Server running at: http://localhost:5850
echo   -^> Admin login:       admin@amhsolutions.com / changeme
echo   -^> Demo client:       demo@client.com / demo1234
echo.
echo   Close this window to stop the server.
echo ===============================================
echo.

python server.py
