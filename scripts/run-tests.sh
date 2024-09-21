#!/bin/bash

set -e

echo "Running test suite for ERM Experts Risk Management Platform..."

# Load environment variables
if [ -f .env.test ]; then
    export $(cat .env.test | grep -v '^#' | xargs)
else
    echo "Error: .env.test file not found."
    exit 1
fi

# Function to run a test suite and check for errors
run_test_suite() {
    local suite_name=$1
    local npm_script=$2
    
    echo "Running $suite_name tests..."
    if ! npm run $npm_script; then
        echo "Error: $suite_name tests failed."
        exit 1
    fi
}

# Parse command line arguments
SUITES_TO_RUN="all"
GENERATE_REPORT=false
PARALLEL=false

while getopts ":s:rp" opt; do
  case $opt in
    s) SUITES_TO_RUN="$OPTARG";;
    r) GENERATE_REPORT=true;;
    p) PARALLEL=true;;
    \?) echo "Invalid option -$OPTARG" >&2; exit 1;;
  esac
done

# Run test suites based on arguments
if [ "$PARALLEL" = true ] && [ "$SUITES_TO_RUN" = "all" ]; then
    echo "Running all test suites in parallel..."
    npm run test:unit & npm run test:integration & npm run test:e2e
    wait
else
    if [ "$SUITES_TO_RUN" = "all" ] || [[ "$SUITES_TO_RUN" == *"unit"* ]]; then
        run_test_suite "unit" "test:unit"
    fi
    if [ "$SUITES_TO_RUN" = "all" ] || [[ "$SUITES_TO_RUN" == *"integration"* ]]; then
        run_test_suite "integration" "test:integration"
    fi
    if [ "$SUITES_TO_RUN" = "all" ] || [[ "$SUITES_TO_RUN" == *"e2e"* ]]; then
        run_test_suite "end-to-end" "test:e2e"
    fi
fi

# Generate test report if flag is set
if [ "$GENERATE_REPORT" = true ]; then
    echo "Generating test report..."
    npm run generate-test-report
fi

# Check test coverage
echo "Checking test coverage..."
if ! npm run check-coverage; then
    echo "Error: Test coverage is below the threshold."
    exit 1
fi

echo "Test suite execution completed successfully."