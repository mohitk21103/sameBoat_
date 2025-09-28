#!/bin/bash
set -e

echo "🚀 Starting frontend build process..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the project
echo "🏗️ Building frontend..."
npm run build

echo "✅ Frontend build completed successfully!"
