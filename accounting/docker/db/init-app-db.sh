#!/bin/bash

# This line just tells the shell to stop if any error.
set -e

# Create a new user that will not have the role to bypass row level security.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER $POSTGRES_APP_USER WITH PASSWORD '$POSTGRES_APP_PASSWORD';
	GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $APP_USER;
EOSQL
