#!/bin/bash

# KM Media Training Institute - Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting KM Media Training Institute Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
NODE_VERSION="18"

echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"

# Check if Node.js version is correct
check_node_version() {
    echo -e "${YELLOW}Checking Node.js version...${NC}"
    if ! node --version | grep -q "v${NODE_VERSION}"; then
        echo -e "${RED}Error: Node.js version ${NODE_VERSION} is required${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js version check passed${NC}"
}

# Check environment variables
check_environment() {
    echo -e "${YELLOW}Checking environment variables...${NC}"
    
    required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "PAYSTACK_SECRET_KEY"
        "PAYSTACK_PUBLIC_KEY"
        "CLOUDINARY_CLOUD_NAME"
        "CLOUDINARY_API_KEY"
        "CLOUDINARY_API_SECRET"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required environment variables:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    # Check JWT secret strength
    if [ ${#JWT_SECRET} -lt 32 ]; then
        echo -e "${RED}Error: JWT_SECRET must be at least 32 characters long${NC}"
        exit 1
    fi
    
    if [ ${#JWT_REFRESH_SECRET} -lt 32 ]; then
        echo -e "${RED}Error: JWT_REFRESH_SECRET must be at least 32 characters long${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Environment variables check passed${NC}"
}

# Install dependencies
install_dependencies() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm ci --only=production
    echo -e "${GREEN}✓ Dependencies installed${NC}"
}

# Run database migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    npx prisma migrate deploy
    echo -e "${GREEN}✓ Database migrations completed${NC}"
}

# Generate Prisma client
generate_prisma() {
    echo -e "${YELLOW}Generating Prisma client...${NC}"
    npx prisma generate
    echo -e "${GREEN}✓ Prisma client generated${NC}"
}

# Build application
build_application() {
    echo -e "${YELLOW}Building application...${NC}"
    npm run build
    echo -e "${GREEN}✓ Application built successfully${NC}"
}

# Run security checks
security_checks() {
    echo -e "${YELLOW}Running security checks...${NC}"
    
    # Check for common security issues
    if grep -r "password.*=" . --exclude-dir=node_modules --exclude="*.log" | grep -v "process.env" | grep -v "bcrypt"; then
        echo -e "${RED}Warning: Potential hardcoded passwords found${NC}"
    fi
    
    # Check for console.log in production
    if [ "$ENVIRONMENT" = "production" ] && grep -r "console.log" src/ --exclude-dir=node_modules; then
        echo -e "${YELLOW}Warning: console.log statements found in production code${NC}"
    fi
    
    echo -e "${GREEN}✓ Security checks completed${NC}"
}

# Health check
health_check() {
    echo -e "${YELLOW}Running health checks...${NC}"
    
    # Start application in background
    npm start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 10
    
    # Check health endpoint
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Application health check passed${NC}"
    else
        echo -e "${RED}Error: Application health check failed${NC}"
        kill $APP_PID 2>/dev/null || true
        exit 1
    fi
    
    # Kill background process
    kill $APP_PID 2>/dev/null || true
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    check_node_version
    check_environment
    install_dependencies
    generate_prisma
    run_migrations
    security_checks
    build_application
    health_check
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}Your application is ready for production.${NC}"
}

# Run main function
main "$@"
