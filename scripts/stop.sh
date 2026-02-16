#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_DIR="$ROOT_DIR/.pids"

echo "=== Stopping DailyAI ==="

for service in backend frontend; do
  PID_FILE="$PID_DIR/$service.pid"
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      echo "Stopping $service (PID $PID)..."
      kill "$PID" 2>/dev/null || true
    else
      echo "$service already stopped."
    fi
    rm -f "$PID_FILE"
  else
    echo "No PID file for $service."
  fi
done

echo "=== All services stopped ==="
