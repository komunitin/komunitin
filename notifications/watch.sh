#!/bin/bash

COMMAND="dlv debug github.com/komunitin/komunitin/notifications --listen :40000 --headless=true --log=true --api-version=2 --accept-multiclient --continue ."
# Run debugger
echo "Starting debugger..."
$COMMAND &
# Watch for changes in the source code and rebuild the project.
inotifywait -m -r -e modify,moved_to,create . |
    while read -r path action file; do
        ext=${file: -3}
        if [[ "$ext" == ".go" ]]; then
            echo "File changed $file. Building..."
            killall dlv
            echo "Restarting..."
            $COMMAND &
        fi
    done