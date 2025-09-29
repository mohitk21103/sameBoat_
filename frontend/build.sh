#!/bin/bash
set -e

echo "🚀 Starting frontend build process..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the CSS
echo "🏗️ Building CSS..."
npm run build:css

echo "✅ Frontend build completed successfully!"
