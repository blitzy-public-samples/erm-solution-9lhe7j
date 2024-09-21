#!/bin/bash

set -e

echo "Running database migrations for ERM Experts Risk Management Platform..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Check database connectivity
echo "Checking database connectivity..."
if ! npx sequelize-cli db:migrate:status > /dev/null 2>&1; then
    echo "Error: Unable to connect to the database. Please check your connection settings."
    exit 1
fi

# Determine environment
ENV=${NODE_ENV:-development}
echo "Running migrations for $ENV environment"

# Prompt for confirmation in production
if [ "$ENV" = "production" ]; then
    read -p "You are about to run migrations in production. Are you sure? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration cancelled."
        exit 1
    fi
fi

# Run migrations
echo "Applying database migrations..."
if [ "$1" = "--dry-run" ]; then
    echo "Dry run mode: Previewing migration changes..."
    npx sequelize-cli db:migrate --dry-run
else
    npx sequelize-cli db:migrate --env $ENV
fi

# Check for successful migration
if [ $? -eq 0 ]; then
    echo "Database migrations completed successfully."
else
    echo "Error: Database migrations failed."
    echo "Rolling back to previous state..."
    npx sequelize-cli db:migrate:undo
    echo "Rollback completed. Please check the migration files and try again."
    exit 1
fi

echo "Migration process completed."