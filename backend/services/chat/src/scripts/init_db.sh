#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -h db_chat -p 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Create the database if it does not exist
psql -U "$POSTGRES_USER" -h db_chat -p 5432 -d postgres -c "CREATE DATABASE $POSTGRES_DB;" || :

# Run the initialization SQL script
psql -U "$POSTGRES_USER" -h db_chat -p 5432 -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/init_db.sql

# Start PostgreSQL server (if you need this to be explicitly done)
exec docker-entrypoint.sh postgres
