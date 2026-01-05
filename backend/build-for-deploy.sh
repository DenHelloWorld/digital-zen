#!/bin/bash
set -e  # Exit on error
set -u  # Exit on undefined variable
set -o pipefail  # Catch failures in pipelines

# Digital Zen Backend - Deployment Package Builder
# This script creates a deployment-ready package for Hostinger

echo "========================================="
echo "Digital Zen Backend - Build for Deploy"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "artisan" ]; then
    echo "Error: Please run this script from the backend directory"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing production dependencies...${NC}"
if ! composer install --optimize-autoloader --no-dev --no-interaction; then
    echo "Error: Composer install failed"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}Step 2: Clearing cache and config...${NC}"
php artisan config:clear
php artisan cache:clear
php artisan view:clear

echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

echo -e "${YELLOW}Step 3: Creating deployment package...${NC}"

# Create a temporary directory for deployment files
DEPLOY_DIR="../backend-deploy"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy necessary files (excluding vendor since it will be reinstalled on server)
echo "Copying files..."
rsync -av \
    --exclude='vendor' \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.env' \
    --exclude='storage/logs/*' \
    --exclude='.phpunit.result.cache' \
    --exclude='tests' \
    . $DEPLOY_DIR/

# Create necessary directories in storage
mkdir -p $DEPLOY_DIR/storage/framework/cache/data
mkdir -p $DEPLOY_DIR/storage/framework/sessions
mkdir -p $DEPLOY_DIR/storage/framework/views
mkdir -p $DEPLOY_DIR/storage/logs

# Create .gitkeep files
touch $DEPLOY_DIR/storage/framework/cache/data/.gitkeep
touch $DEPLOY_DIR/storage/framework/sessions/.gitkeep
touch $DEPLOY_DIR/storage/framework/views/.gitkeep
touch $DEPLOY_DIR/storage/logs/.gitkeep

echo -e "${GREEN}✓ Files copied${NC}"
echo ""

echo -e "${YELLOW}Step 4: Creating zip archive...${NC}"
cd ..
zip -r backend-hostinger.zip backend-deploy/ -q

echo -e "${GREEN}✓ Deployment package created: backend-hostinger.zip${NC}"
echo ""

# Cleanup
rm -rf backend-deploy

echo "========================================="
echo "Build Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Upload 'backend-hostinger.zip' to Hostinger"
echo "2. Extract it in your public_html directory"
echo "3. Follow HOSTINGER_DEPLOYMENT.md for server setup"
echo ""
echo "File location: ../backend-hostinger.zip"
echo ""
