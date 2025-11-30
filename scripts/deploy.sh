#!/bin/bash

# Production Deployment Helper Script
# This script helps you set up and deploy to production

set -e

echo "🚀 KM Media LMS - Production Deployment Helper"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git installed${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js installed ($(node --version))${NC}"

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm installed ($(npm --version))${NC}"

echo ""
echo "🔍 Checking environment variables..."
npx tsx scripts/verify-env.ts
ENV_CHECK=$?

if [ $ENV_CHECK -ne 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Some environment variables are missing${NC}"
    echo "Please configure them before deploying to production"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🏗️  Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

echo ""
echo "📦 What would you like to do?"
echo "1) Deploy to Vercel (recommended)"
echo "2) Generate deployment checklist"
echo "3) Generate environment variable template"
echo "4) Exit"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        if ! command_exists vercel; then
            echo "Installing Vercel CLI..."
            npm i -g vercel
        fi
        
        echo "🚀 Deploying to Vercel..."
        echo ""
        read -p "Deploy to production? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vercel --prod
        else
            vercel
        fi
        ;;
    2)
        echo ""
        echo "📋 Pre-Deployment Checklist"
        echo "============================"
        echo ""
        echo "Database:"
        echo "  [ ] Production database created (Supabase/Railway/etc.)"
        echo "  [ ] DATABASE_URL configured"
        echo "  [ ] Migrations run: npx prisma migrate deploy"
        echo ""
        echo "Email Service:"
        echo "  [ ] Email service configured (SendGrid/Resend)"
        echo "  [ ] EMAIL_* variables set"
        echo "  [ ] Sender email verified"
        echo ""
        echo "Payment:"
        echo "  [ ] Paystack live mode enabled"
        echo "  [ ] Production API keys configured"
        echo "  [ ] Webhook URL configured"
        echo ""
        echo "Security:"
        echo "  [ ] JWT secrets generated (64+ characters)"
        echo "  [ ] Redis configured for rate limiting"
        echo "  [ ] CORS configured for production domain"
        echo ""
        echo "Monitoring:"
        echo "  [ ] Sentry configured"
        echo "  [ ] Error alerts set up"
        echo ""
        echo "Domain:"
        echo "  [ ] Domain purchased/configured"
        echo "  [ ] SSL certificate active"
        echo "  [ ] DNS records configured"
        echo ""
        ;;
    3)
        echo ""
        npx tsx scripts/verify-env.ts --template
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Done!${NC}"
