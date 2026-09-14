#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "This script will stop Void, remove the installed app, and delete caches, databases, and preferences."
read -r -p "Continue with the full uninstall? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

remove_target() {
  local target="$1"
  if [[ -e "$target" ]]; then
    echo "Removing $target"
    rm -rf "$target" 2>/dev/null || sudo rm -rf "$target"
  fi
}

echo "Stopping running Void/Electron processes..."
pkill -f "Void" 2>/dev/null || true
pkill -f "void" 2>/dev/null || true
pkill -f "Electron Helper.*Void" 2>/dev/null || true

echo "Removing /Applications/Void.app (requires admin)..."
remove_target "/Applications/Void.app"

echo "Purging Application Support data..."
remove_target "$HOME/Library/Application Support/Void"
remove_target "$HOME/Library/Application Support/void"
remove_target "$HOME/Library/Application Support/Void-dev"
remove_target "$HOME/Library/Application Support/com.void"
remove_target "$HOME/Library/Application Support/com.void.Void"

echo "Removing caches, logs, and saved state..."
remove_target "$HOME/Library/Caches/void"
remove_target "$HOME/Library/Caches/com.void.Void"
remove_target "$HOME/Library/Preferences/com.void.Void.plist"
remove_target "$HOME/Library/Preferences/com.void.helper.plist"
remove_target "$HOME/Library/Logs/Void"
remove_target "$HOME/Library/Saved Application State/com.void.Void.savedState"

echo "Cleaning temporary files..."
shopt -s nullglob
for tmp in /tmp/void*; do
  remove_target "$tmp"
done
for crash in "$HOME/Library/Application Support/CrashReporter"/Void_*; do
  remove_target "$crash"
done
shopt -u nullglob

read -r -p "Remove downloaded Whisper models and caches (~/.cache/whisper, ~/Library/Application Support/whisper)? [y/N]: " wipe_models
if [[ "$wipe_models" =~ ^[Yy]$ ]]; then
  remove_target "$HOME/.cache/whisper"
  remove_target "$HOME/Library/Application Support/whisper"
  remove_target "$HOME/Library/Application Support/Void/models"
fi

ENV_FILE="$PROJECT_ROOT/.env"
if [[ -f "$ENV_FILE" ]]; then
  read -r -p "Remove the local environment file at $ENV_FILE? [y/N]: " wipe_env
  if [[ "$wipe_env" =~ ^[Yy]$ ]]; then
    echo "Removing $ENV_FILE"
    rm -f "$ENV_FILE"
  fi
fi

cat <<'EOF'
macOS keeps microphone, screen recording, and accessibility approvals even after files are removed.
Reset them if you want a truly fresh start:
  tccutil reset Microphone com.void.app
  tccutil reset Accessibility com.void.app
  tccutil reset ScreenCapture com.void.app

Full uninstall complete. Reboot if you removed permissions, then reinstall or run npm scripts on a clean tree.
EOF
