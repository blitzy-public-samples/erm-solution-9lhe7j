#!/bin/bash

set -e

echo "Setting up development environment for ERM Experts Risk Management Platform..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo >&2 "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed. Aborting."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is required but not installed. Aborting."; exit 1; }

# Install dependencies
echo "Installing dependencies..."
npm install

# Set up environment variables
echo "Setting up environment variables..."
cp .env.example .env
echo "Please update the .env file with your local configuration."

# Set up database
echo "Setting up database..."
docker-compose up -d postgres redis
npm run migrate
npm run seed

# Build frontend
echo "Building frontend..."
npm run build:frontend

# Start development server
echo "Starting development server..."
npm run dev

echo "Development environment setup complete. Happy coding!"