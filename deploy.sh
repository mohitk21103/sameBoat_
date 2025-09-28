#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "📦 Installing Render CLI..."
    curl -fsSL https://cli.render.com/install | sh
fi

# Login to Render (if not already logged in)
echo "🔐 Logging into Render..."
render auth login

# Deploy services
echo "🚀 Deploying services to Render..."
render services create --file render.yaml

echo "✅ Deployment completed successfully!"
echo "🌐 Your services should be available at:"
echo "   - Backend: https://samboat-backend.onrender.com"
echo "   - Frontend: https://samboat-frontend.onrender.com"
