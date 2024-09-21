#!/bin/bash

set -e

echo "Building frontend for ERM Experts Risk Management Platform..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Check for required environment variables
required_vars=("NODE_ENV" "API_URL" "PUBLIC_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Required environment variable $var is not set."
        exit 1
    fi
done

# Clean previous build
echo "Cleaning previous build..."
rm -rf build

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build frontend
echo "Building frontend application..."
npm run build

# Check for successful build
if [ $? -eq 0 ]; then
    echo "Frontend build completed successfully."
else
    echo "Error: Frontend build failed."
    exit 1
fi

# Optimize assets
echo "Optimizing assets..."
npm run optimize-assets

# Generate build report
echo "Generating build report..."
npm run build:report

# Add build timestamp
echo "Adding build timestamp..."
echo "BUILD_TIMESTAMP=$(date +%Y%m%d%H%M%S)" >> build/build_info.txt

echo "Frontend build process completed."