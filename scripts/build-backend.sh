#!/bin/bash

set -e

echo "Building backend for ERM Experts Risk Management Platform..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Clean previous build artifacts
echo "Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run linting and type checking
echo "Running linting and type checking..."
npm run lint
npm run type-check

# Transpile TypeScript
echo "Transpiling TypeScript..."
npm run build:ts

# Check for successful build
if [ $? -eq 0 ]; then
    echo "Backend build completed successfully."
else
    echo "Error: Backend build failed."
    exit 1
fi

# Generate API documentation
echo "Generating API documentation..."
npm run generate-api-docs

# Copy necessary files
echo "Copying configuration files..."
cp package.json dist/
cp .env dist/

# Install production dependencies
echo "Installing production dependencies..."
cd dist && npm ci --only=production

# Add build timestamp
echo "Adding build timestamp..."
echo "BUILD_TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> dist/.env

echo "Backend build process completed."