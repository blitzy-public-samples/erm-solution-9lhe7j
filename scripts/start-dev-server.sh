#!/bin/bash

set -e

echo "Starting development server for ERM Experts Risk Management Platform..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$PORT" ] || [ -z "$DATABASE_URL" ]; then
    echo "Error: Required environment variables are not set."
    exit 1
fi

# Check Node.js and npm versions
required_node_version="14.0.0"
required_npm_version="6.0.0"

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed."
    exit 1
fi

node_version=$(node -v | cut -d 'v' -f 2)
npm_version=$(npm -v)

if [ "$(printf '%s\n' "$required_node_version" "$node_version" | sort -V | head -n1)" != "$required_node_version" ]; then
    echo "Error: Node.js version $required_node_version or higher is required."
    exit 1
fi

if [ "$(printf '%s\n' "$required_npm_version" "$npm_version" | sort -V | head -n1)" != "$required_npm_version" ]; then
    echo "Error: npm version $required_npm_version or higher is required."
    exit 1
fi

# Function to start a server
start_server() {
    local server_type=$1
    local log_file="logs/${server_type}_server.log"
    
    mkdir -p logs
    echo "Starting $server_type server..."
    npm run start:$server_type > "$log_file" 2>&1 &
    echo "$!" > "${server_type}_pid.txt"
}

# Function to stop servers
stop_servers() {
    echo "Stopping development servers..."
    if [ -f backend_pid.txt ]; then
        kill $(cat backend_pid.txt) 2>/dev/null || true
        rm backend_pid.txt
    fi
    if [ -f frontend_pid.txt ]; then
        kill $(cat frontend_pid.txt) 2>/dev/null || true
        rm frontend_pid.txt
    fi
    exit 0
}

# Set up trap to handle script interruption
trap stop_servers INT TERM

# Start servers
start_server "backend"
start_server "frontend"

# Health check function
health_check() {
    local server_type=$1
    local max_attempts=30
    local attempt=1
    local url

    if [ "$server_type" = "backend" ]; then
        url="http://localhost:$PORT/api/health"
    else
        url="http://localhost:3000"  # Assuming frontend runs on port 3000
    fi

    echo "Performing health check for $server_type server..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
            echo "$server_type server is up and running."
            return 0
        fi
        echo "Attempt $attempt: $server_type server is not ready yet. Retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done

    echo "Error: $server_type server failed to start after $max_attempts attempts."
    stop_servers
    exit 1
}

# Perform health checks
health_check "backend"
health_check "frontend"

echo "Development servers started successfully."
echo "Backend server log: logs/backend_server.log"
echo "Frontend server log: logs/frontend_server.log"

# Keep the script running
wait