#!/bin/bash

set -e

echo "Deploying ERM Experts Risk Management Platform to production..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "Error: .env.production file not found."
    exit 1
fi

# Pull latest changes
echo "Pulling latest changes from repository..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build frontend
echo "Building frontend..."
npm run build:frontend

# Build backend
echo "Building backend..."
npm run build:backend

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Restart application services
echo "Restarting application services..."
pm2 restart erm-platform

# Verify deployment
echo "Verifying deployment..."
curl -f http://localhost:$PORT/api/health || { echo "Deployment verification failed"; exit 1; }

echo "Deployment to production completed successfully."