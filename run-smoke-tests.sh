#!/bin/bash

# Saleor Smoke Tests Runner for macOS iTerm2
# This script automates the setup and execution of smoke tests

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher. Current: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed successfully"
    
    print_status "Installing Playwright browsers..."
    npm run test:install
    print_success "Playwright browsers installed"
}

# Check if Saleor storefront is running
check_saleor_status() {
    print_status "Checking if Saleor storefront is running on localhost:3000..."
    
    if curl -s --connect-timeout 5 http://localhost:3000 > /dev/null; then
        print_success "Saleor storefront is running on localhost:3000"
        return 0
    else
        print_warning "Saleor storefront is not running on localhost:3000"
        print_status "Please start Saleor storefront first:"
        echo "  cd ../storefront/saleor-storefront-installed-manually-from-fork"
        echo "  npm run dev"
        
        read -p "Press Enter when Saleor is running, or 'q' to quit: " choice
        if [ "$choice" = "q" ]; then
            exit 1
        fi
        
        # Check again
        if curl -s --connect-timeout 5 http://localhost:3000 > /dev/null; then
            print_success "Saleor storefront is now running"
        else
            print_error "Saleor storefront is still not accessible"
            exit 1
        fi
    fi
}

# Run tests
run_tests() {
    print_status "Running smoke tests..."
    
    # Create results directory
    mkdir -p test-results/screenshots
    
    # Run tests with options
    case "${1:-basic}" in
        "basic")
            npm run test:smoke
            ;;
        "headed")
            npm run test:headed
            ;;
        "debug")
            npm run test:debug
            ;;
        "ui")
            npm run test:ui
            ;;
        *)
            npm test
            ;;
    esac
    
    TEST_EXIT_CODE=$?
    
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        print_success "All smoke tests passed!"
    else
        print_error "Some tests failed. Check the reports for details."
    fi
    
    return $TEST_EXIT_CODE
}

# Generate and open report
open_report() {
    print_status "Generating test report..."
    npm run test:report
    
    if [ -f "playwright-report/index.html" ]; then
        print_success "Opening test report in browser..."
        open playwright-report/index.html
    fi
}

# Main execution
main() {
    echo "🚀 Saleor Smoke Tests Runner"
    echo "=============================="
    
    # Parse arguments
    TEST_MODE="${1:-basic}"
    OPEN_REPORT="${2:-false}"
    
    # Show usage if help requested
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "Usage: $0 [test_mode] [open_report]"
        echo ""
        echo "Test modes:"
        echo "  basic     - Run tests in headless mode (default)"
        echo "  headed    - Run tests with visible browser"
        echo "  debug     - Run tests in debug mode"
        echo "  ui        - Launch Playwright UI mode"
        echo ""
        echo "Open report:"
        echo "  true      - Open HTML report after tests"
        echo "  false     - Don't open report (default)"
        echo ""
        echo "Examples:"
        echo "  $0                    # Run basic smoke tests"
        echo "  $0 headed true        # Run with visible browser and open report"
        echo "  $0 debug              # Run in debug mode"
        exit 0
    fi
    
    # Execute steps
    check_prerequisites
    install_dependencies
    check_saleor_status
    
    if run_tests "$TEST_MODE"; then
        if [ "$OPEN_REPORT" = "true" ]; then
            open_report
        fi
        print_success "Smoke tests completed successfully! 🎉"
        exit 0
    else
        print_error "Smoke tests failed! 😞"
        if [ "$OPEN_REPORT" != "false" ]; then
            open_report
        fi
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
