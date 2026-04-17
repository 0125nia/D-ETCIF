SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROFILE_DIR=$(ipython profile locate)

STARTUP_DIR="$PROFILE_DIR/startup"

cp -r "$SCRIPT_DIR/../00-monitor.py" "$STARTUP_DIR/00-monitor.py"