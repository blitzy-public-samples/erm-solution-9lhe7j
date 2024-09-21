#!/bin/bash

set -e

echo "Seeding database for ERM Experts Risk Management Platform..."

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
    echo "Error: Unable to connect to the database. Please check your connection details."
    exit 1
fi

# Function to run seeds for a specific environment
run_seeds() {
    local env=$1
    echo "Running seeds for $env environment..."
    npx sequelize-cli db:seed:all --env $env
}

# Check if it's a dry run
if [ "$1" = "--dry-run" ]; then
    echo "Performing a dry run. No changes will be applied to the database."
    npx sequelize-cli db:seed:all --dry-run
    exit 0
fi

# Prompt for confirmation in production environment
if [ "$NODE_ENV" = "production" ]; then
    read -p "You are about to seed the production database. Are you sure? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Seeding cancelled."
        exit 1
    fi
fi

# Run seed files
echo "Applying database seeds..."
run_seeds $NODE_ENV

# Log individual seed files
echo "Seed files applied:"
npx sequelize-cli db:seed:status

# Check for successful seeding
if [ $? -eq 0 ]; then
    echo "Database seeding completed successfully."
else
    echo "Error: Database seeding failed."
    exit 1
fi

echo "Seeding process completed."