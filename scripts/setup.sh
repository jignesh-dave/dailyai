#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"

echo "=== DailyAI Setup ==="

# Create .env from template if missing
if [ ! -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env.template" "$ROOT_DIR/.env"
  echo ""
  echo "Created .env file from template."
  echo "Please fill in your credentials before running the app:"
  echo ""
  echo "  1. GOOGLE_API_KEY      - Gemini API key from https://aistudio.google.com/apikey"
  echo "  2. GOOGLE_CLIENT_ID    - OAuth2 client ID from Google Cloud Console"
  echo "  3. GOOGLE_CLIENT_SECRET - OAuth2 client secret"
  echo ""
  echo "To set up Google OAuth2 credentials:"
  echo "  - Go to https://console.cloud.google.com/"
  echo "  - Create a project and enable 'Google Calendar API' and 'Gmail API'"
  echo "  - Configure OAuth consent screen (External, test mode)"
  echo "  - Create OAuth2 credentials (Web application type)"
  echo "  - Set redirect URI: http://localhost:8000/api/auth/callback"
  echo ""
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd "$ROOT_DIR/backend"
uv sync

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
bun install

echo ""
echo "=== Setup complete ==="
