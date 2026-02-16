#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$HOME/.local/bin:$HOME/.bun/bin:$PATH"
PID_DIR="$ROOT_DIR/.pids"
mkdir -p "$PID_DIR"

echo "=== Starting DailyAI ==="

# Start backend
echo "Starting backend (uvicorn on :8000)..."
cd "$ROOT_DIR/backend"
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload > "$PID_DIR/backend.log" 2>&1 &
echo $! > "$PID_DIR/backend.pid"

# Start frontend
echo "Starting frontend (vite on :5173)..."
cd "$ROOT_DIR/frontend"
bun run dev > "$PID_DIR/frontend.log" 2>&1 &
echo $! > "$PID_DIR/frontend.pid"

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Run 'bash scripts/stop.sh' to stop both services."
