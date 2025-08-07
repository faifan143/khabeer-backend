#!/bin/bash

# Khabeer Backend - Prisma Client Regeneration Script
# This script regenerates the Prisma client to include all models

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Regenerating Prisma client..."

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "Prisma schema not found. Please run this script from the khabeer-backend directory."
    exit 1
fi

# Generate Prisma client
print_status "Running: npm run prisma:generate"
npm run prisma:generate

print_success "Prisma client regenerated successfully!"

# Show what was generated
print_status "Generated files:"
ls -la generated/prisma/

print_success "You can now run 'npm run build' to build the application." 