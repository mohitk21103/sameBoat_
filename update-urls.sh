#!/bin/bash
set -e

echo "🔄 URL Update Script for Post-Deployment"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo ""
echo "This script will help you update URLs after manual deployment."
echo ""

# Get user input
read -p "Enter your actual backend URL (e.g., https://samboat-backend-abc123.onrender.com): " BACKEND_URL
read -p "Enter your actual frontend URL (e.g., https://samboat-frontend-xyz789.onrender.com): " FRONTEND_URL

# Extract domain names
BACKEND_DOMAIN=$(echo $BACKEND_URL | sed 's|https://||')
FRONTEND_DOMAIN=$(echo $FRONTEND_URL | sed 's|https://||')

echo ""
echo "📝 Updating files with:"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend Domain: $BACKEND_DOMAIN"
echo "Frontend Domain: $FRONTEND_DOMAIN"
echo ""

# Update render.yaml
echo "🔄 Updating render.yaml..."
sed -i "s|https://samboat-frontend.onrender.com|$FRONTEND_URL|g" render.yaml
sed -i "s|samboat-backend.onrender.com|$BACKEND_DOMAIN|g" render.yaml
sed -i "s|https://samboat-backend.onrender.com|$BACKEND_URL|g" render.yaml
echo "✅ render.yaml updated"

# Update environment files if they exist
if [ -f "backend/.env.production" ]; then
    echo "🔄 Updating backend/.env.production..."
    sed -i "s|https://samboat-frontend.onrender.com|$FRONTEND_URL|g" backend/.env.production
    sed -i "s|samboat-backend.onrender.com|$BACKEND_DOMAIN|g" backend/.env.production
    echo "✅ backend/.env.production updated"
fi

if [ -f "backend/.env.staging" ]; then
    echo "🔄 Updating backend/.env.staging..."
    sed -i "s|https://samboat-frontend.onrender.com|$FRONTEND_URL|g" backend/.env.staging
    sed -i "s|samboat-backend.onrender.com|$BACKEND_DOMAIN|g" backend/.env.staging
    echo "✅ backend/.env.staging updated"
fi

# Update documentation files
echo "🔄 Updating documentation files..."
sed -i "s|https://samboat-backend.onrender.com|$BACKEND_URL|g" DEPLOYMENT.md
sed -i "s|https://samboat-frontend.onrender.com|$FRONTEND_URL|g" DEPLOYMENT.md
sed -i "s|samboat-backend.onrender.com|$BACKEND_DOMAIN|g" DEPLOYMENT.md
sed -i "s|samboat-frontend.onrender.com|$FRONTEND_DOMAIN|g" DEPLOYMENT.md

sed -i "s|https://samboat-backend.onrender.com|$BACKEND_URL|g" RENDER_DEPLOYMENT_SUMMARY.md
sed -i "s|https://samboat-frontend.onrender.com|$FRONTEND_URL|g" RENDER_DEPLOYMENT_SUMMARY.md
sed -i "s|samboat-backend.onrender.com|$BACKEND_DOMAIN|g" RENDER_DEPLOYMENT_SUMMARY.md
sed -i "s|samboat-frontend.onrender.com|$FRONTEND_DOMAIN|g" RENDER_DEPLOYMENT_SUMMARY.md
echo "✅ Documentation files updated"

# Update frontend API client if it exists
if [ -f "frontend/src/js/api/client.js" ]; then
    echo "🔄 Updating frontend API client..."
    sed -i "s|https://samboat-backend.onrender.com|$BACKEND_URL|g" frontend/src/js/api/client.js
    echo "✅ Frontend API client updated"
fi

echo ""
echo "🎉 URL update completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the changes:"
echo "   git diff"
echo ""
echo "2. Commit the changes:"
echo "   git add ."
echo "   git commit -m 'Update with production URLs'"
echo ""
echo "3. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "4. Set up GitHub secrets for CI/CD:"
echo "   - RENDER_API_KEY"
echo "   - RENDER_PRODUCTION_SERVICE_ID"
echo ""
echo "✅ Your CI/CD pipeline will now work with the correct URLs!"
