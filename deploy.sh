#!/usr/bin/env bash
#
# Deploy evotech-web (Next.js) on the VPS.
#
#   cd ~/htdocs/evotech-sys.com && ./deploy.sh
#
# Every step here exists because of something that actually went wrong:
#
#   * The site once served HTML referencing JS chunks that 404'd. A rebuild had
#     replaced .next while the old process kept serving the previous build's
#     manifest from memory. It had been running, unrestarted, for two days.
#     => build and restart are one operation here; you cannot do the first and
#        forget the second.
#
#   * `git pull` failed with "divergent branches" because the server had its own
#     commit (npm install had rewritten package-lock.json).
#     => we pull --ff-only and refuse to run with a dirty tree, so the server can
#        never grow its own history.
#
#   * `npm install` rewrites package-lock.json; `npm ci` never does.
#     => always ci.
#
# Exit codes: 0 ok, 1 preflight/deploy failure, 2 started but unhealthy.

set -Eeuo pipefail

BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
LOG_FILE="${LOG_FILE:-$HOME/next.log}"
PID_FILE="${PID_FILE:-$HOME/next.pid}"
HEALTH_PATH="${HEALTH_PATH:-/ar}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-60}"

RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; OFF=$'\033[0m'
step() { printf '\n%s==> %s%s\n' "$BOLD" "$1" "$OFF"; }
ok()   { printf '%s  ✓ %s%s\n' "$GREEN" "$1" "$OFF"; }
warn() { printf '%s  ! %s%s\n' "$YELLOW" "$1" "$OFF"; }
die()  { printf '\n%s  ✗ %s%s\n\n' "$RED" "$1" "$OFF" >&2; exit "${2:-1}"; }

trap 'die "Failed on line $LINENO. The site may be DOWN — see $LOG_FILE and fix forward."' ERR

cd "$APP_DIR"

# ── Which port? ───────────────────────────────────────────────────────────────
# Read it off the running process rather than assuming. Nginx proxies to a fixed
# port; restarting on a different one takes the whole site down, not just a page.
detect_port() {
  local pid env_port
  pid="$(pgrep -f 'next-server' | head -1 || true)"
  if [[ -n "$pid" && -r "/proc/$pid/environ" ]]; then
    env_port="$(tr '\0' '\n' < "/proc/$pid/environ" | sed -n 's/^PORT=//p' | head -1)"
    [[ -n "$env_port" ]] && { echo "$env_port"; return; }
  fi
  echo "${PORT:-3000}"   # `next start` default
}
PORT="$(detect_port)"

# ── 1. Preflight ──────────────────────────────────────────────────────────────
step "Preflight"

[[ -f package.json ]] || die "No package.json in $APP_DIR — wrong directory?"
command -v node >/dev/null || die "node not found"
command -v npm  >/dev/null || die "npm not found"

# A dirty tree on a deploy target means someone edited or npm rewrote something
# here. Deploying over it either loses that work or resurrects the divergence.
# Stop and let a human look.
if [[ -n "$(git status --porcelain)" ]]; then
  git status --short
  die "Working tree is dirty. Production must never carry local changes.
     Inspect the above, then 'git checkout -- <file>' to discard, and re-run."
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"
[[ "$current_branch" == "$BRANCH" ]] || die "On branch '$current_branch', expected '$BRANCH'."

ok "dir=$APP_DIR  branch=$BRANCH  port=$PORT  node=$(node -v)"

# ── 2. Fetch ──────────────────────────────────────────────────────────────────
step "Pulling $BRANCH"

before="$(git rev-parse --short HEAD)"
# --ff-only: fail loudly on divergence instead of creating a merge commit here.
git pull --ff-only origin "$BRANCH"
after="$(git rev-parse --short HEAD)"

if [[ "$before" == "$after" ]]; then
  warn "Already at $after — rebuilding anyway (the build may still be stale)."
else
  ok "$before → $after"
  git --no-pager log --oneline "$before..$after" | sed 's/^/     /'
fi

# ── 3. Dependencies ───────────────────────────────────────────────────────────
step "Installing dependencies (npm ci)"
# ci, never install: install rewrites package-lock.json, which is how this repo
# ended up with a commit the server made to itself.
npm ci --no-audit --no-fund
ok "node_modules matches the lockfile exactly"

# ── 4. Build ──────────────────────────────────────────────────────────────────
step "Building"
# Wipe .next first: chunk filenames are content-hashed, so a partial tree can
# leave orphans that only surface as a 404 in someone's browser.
rm -rf .next
npm run build
[[ -d .next ]] || die "Build produced no .next directory."
ok "fresh build"

# ── 5. Restart ────────────────────────────────────────────────────────────────
# The step that was missed. A new build the old process never loads is worse than
# no deploy: it serves HTML pointing at chunks that no longer exist.
step "Restarting"

stop_app() {
  local pid
  if [[ -f "$PID_FILE" ]] && pid="$(cat "$PID_FILE")" && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
  fi
  # Also catch processes started by hand before this script existed.
  pkill -f 'next-server'   2>/dev/null || true
  pkill -f 'sh -c next start' 2>/dev/null || true
  rm -f "$PID_FILE"

  for _ in $(seq 1 10); do
    pgrep -f 'next-server' >/dev/null || return 0
    sleep 1
  done
  pkill -9 -f 'next-server' 2>/dev/null || true
  sleep 1
}

stop_app
ok "old process stopped"

# nohup + disown so it outlives this shell. The previous instance died with an
# SSH session's parent once already.
PORT="$PORT" nohup npm start >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
disown || true
ok "started (pid $(cat "$PID_FILE")), logging to $LOG_FILE"

# ── 6. Health check ───────────────────────────────────────────────────────────
# "It started" is not "it works". Ask it for a real page.
step "Health check"

deadline=$(( SECONDS + HEALTH_TIMEOUT ))
until curl -fsS -o /dev/null --max-time 5 "http://127.0.0.1:${PORT}${HEALTH_PATH}"; do
  if (( SECONDS >= deadline )); then
    printf '\n--- last 30 lines of %s ---\n' "$LOG_FILE" >&2
    tail -30 "$LOG_FILE" >&2 || true
    die "Not healthy after ${HEALTH_TIMEOUT}s on port $PORT." 2
  fi
  sleep 2
done
ok "http://127.0.0.1:${PORT}${HEALTH_PATH} → 200"

# The apps' remote config — the response that tells Fawateer which API to talk to.
# If it 404s, the app silently falls back to its baked-in URL, so a broken deploy
# here looks like nothing at all.
#
# The body is checked, not just the status. Since this became a route handler that
# falls back to a committed default, it answers 200 even when the API is
# unreachable — so a status-only check can no longer tell "serving live config"
# from "serving a stale constant".
config_body=$(curl -fsS --max-time 5 "http://127.0.0.1:${PORT}/config/fawateer.json" || true)

if printf '%s' "$config_body" | grep -q '"base_url"'; then
  config_source=$(curl -fsS -o /dev/null -D - --max-time 5 "http://127.0.0.1:${PORT}/config/fawateer.json" 2>/dev/null \
    | tr -d '\r' | awk -F': ' 'tolower($1)=="x-config-source"{print $2}')
  if [ "$config_source" = "fallback" ]; then
    warn "/config/fawateer.json is serving the BUILT-IN FALLBACK — the API is unreachable, so dashboard edits are not live."
  else
    ok "/config/fawateer.json → 200 (from the API)"
  fi
else
  warn "/config/fawateer.json has no base_url — the Fawateer app would fall back to its baked-in API URL."
fi

printf '\n%s  Deployed %s on port %s%s\n\n' "$GREEN" "$after" "$PORT" "$OFF"
