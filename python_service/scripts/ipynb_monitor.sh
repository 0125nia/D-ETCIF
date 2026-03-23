PROFILE_DIR=$(ipython profile locate)

STARTUP_DIR="$PROFILE_DIR/startup"

cp -r ../00_monitor.py "$STARTUP_DIR"