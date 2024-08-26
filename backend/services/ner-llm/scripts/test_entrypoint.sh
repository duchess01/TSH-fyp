#!/usr/bin/env sh

set -euxo pipefail

# Default PostgreSQL credentials and configuration
# PG_USER=${PG_USER:-"langchain"}
# PG_PASSWORD=${PG_PASSWORD:-"langchain"}
# PG_HOST=${PG_HOST:-"localhost"}
# PG_PORT=${PG_PORT:-"5435"}
# PG_DB=${PG_DB:-"langchain_test"}

# # Export PostgreSQL password to avoid password prompt
# export PGPASSWORD=$PG_PASSWORD

# # Check if the database exists
# DB_EXISTS=$(psql -U $PG_USER -h $PG_HOST -p $PG_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='$PG_DB'")

# if [ "$DB_EXISTS" == "1" ]; then
#   echo "Database '$PG_DB' already exists."
# else
#   echo "Creating database '$PG_DB'..."
#   # Create the database
#   psql -U $PG_USER -h $PG_HOST -p $PG_PORT -c "CREATE DATABASE $PG_DB;"
#   if [ $? -eq 0 ]; then
#     echo "Database '$PG_DB' created successfully."
#   else
#     echo "Error creating database '$PG_DB'."
#   fi
# fi

# print working dir
echo "$(ls)" 

# Run tests 

cd ner-llm/tests 


python -m pytest -v

