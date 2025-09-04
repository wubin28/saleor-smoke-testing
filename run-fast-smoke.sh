#!/bin/bash

# Fast Smoke Tests Runner for Saleor
# Optimized for maximum speed with minimal retries

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Running FAST Saleor Smoke Tests (Chrome Only)${NC}"
echo "=================================================="

# Check if Saleor is running
if ! curl -s --connect-timeout 3 http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Saleor storefront is not running on localhost:3000${NC}"
    echo "Please start Saleor first:"
    echo "  cd ../storefront/saleor-storefront-installed-manually-from-fork"
    echo "  npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Saleor storefront is running${NC}"

# Set environment variables for faster execution
export HEADLESS=true
export PWTEST_SKIP_TEST_OUTPUT=1

# Run only Chrome, no retries, minimal reporting
echo -e "${BLUE}📋 Starting fast smoke tests...${NC}"

npx playwright test smoke-test/ \
  --project="Desktop Chrome" \
  --reporter=list \
  --timeout=20000 \
  --retries=0 \
  --workers=1

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All smoke tests passed!${NC}"
    echo "Test execution completed successfully."
else
    echo -e "${RED}❌ Some smoke tests failed.${NC}"
    echo "Check the output above for details."
fi

exit $TEST_EXIT_CODE
