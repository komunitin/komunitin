#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

ERROR=0
ERRORS=""

COMMANDS=('tsc -p tsconfig.json --noEmit' 'npm run lint' 'npm run test:coverage')
COMMANDS_MASTER=('docker build --target komunitin-app-build --tag komunitin-app-build .' 'docker run --rm komunitin-app-build npm run testAll')

help() {
echo -e "

use: prepush.sh [master]

Parameters:

help: This help.
master: More comprehensive test.

This script allows us to verify that our code has no errors before uploading the changes.

For a small commit it would be enough to run it directly, it will run the tests and show us if it has given any error.

Before changing the master we can do a more exhaustive test by executing with the master parameter.

$ prepush master

That will create a docker machine and run the tests inside it.
"
}

launch_command() {

    command="$@"
    echo -e "command ${GREEN}$command${NC}"
    eval "$command"

    if [ $? != 0 ] ; then
        ERROR=$(( $ERROR + 1))
        ERRORS="${ERRORS}\nERROR: $command"
        echo -e "${RED}${ERROR: $command}${NC}"
    else
        echo -e "${GREEN}Ok${NC}"
    fi

}

if [ "$1" == "help" ] ; then 
    help
    exit
fi

for c in "${COMMANDS[@]}" ; do
    launch_command "$c"
done

if [ "$1" == 'master' ] ; then
    for c in "${COMMANDS_MASTER[@]}" ; do
        launch_command "$c"
    done
fi

# Mostrar errores.
if [ "$ERROR" == "0" ] ; then
    echo -e "${GREEN}No errors were detected.${NC}"
else
    echo -e "${RED}Errors: ${ERROR}${ERRORS}${NC}"
fi
