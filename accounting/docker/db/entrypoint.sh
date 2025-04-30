#!/bin/bash
set -e

# Start cron and redirect its output to stdout/stderr
# This ensures cron logs are captured by Docker logging
touch /var/log/cron.log
chmod 0644 /var/log/cron.log

# Start cron in background
cron

# Tail cron log in background so it gets sent to Docker logs
tail -F /var/log/cron.log &

# Execute the original postgres entrypoint with all passed arguments
exec docker-entrypoint.sh "$@"
