#!/bin/bash
set -e

echo "🚀 SameBoat Render Setup Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "📋 This script will help you set up your SameBoat application on Render."
echo ""
echo "Prerequisites:"
echo "1. GitHub repository with your code"
echo "2. Render account (https://render.com)"
echo "3. AWS S3 bucket for file storage"
echo "4. Email service credentials"
echo ""

read -p "Do you have all prerequisites ready? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the prerequisites first, then run this script again."
    exit 1
fi

echo ""
echo "🔧 Setting up environment files..."

# Create .env.local if it doesn't exist
if [ ! -f "backend/.env.local" ]; then
    echo "Creating .env.local template..."
    cat > backend/.env.local << 'EOF'
# Local Development Environment
ENVIRONMENT=local
DEBUG=True
SECRET_KEY=your-local-secret-key-change-this
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION_NAME=us-east-1
EOF
    echo "✅ Created backend/.env.local"
else
    echo "ℹ️ backend/.env.local already exists"
fi

# Create .env.production template
if [ ! -f "backend/.env.production" ]; then
    echo "Creating .env.production template..."
    cat > backend/.env.production << 'EOF'
# Production Environment
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-production-secret-key-change-this
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-app.onrender.com
ALLOWED_HOSTS=your-app.onrender.com,your-frontend-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-production-email@gmail.com
EMAIL_HOST_PASSWORD=your-production-app-password
AWS_ACCESS_KEY_ID=your-production-aws-access-key
AWS_SECRET_ACCESS_KEY=your-production-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-production-s3-bucket
AWS_S3_REGION_NAME=us-east-1
EOF
    echo "✅ Created backend/.env.production"
else
    echo "ℹ️ backend/.env.production already exists"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Update the environment files with your actual credentials"
echo "2. Push your code to GitHub"
echo "3. Create services on Render dashboard:"
echo "   - PostgreSQL database"
echo "   - Redis instance"
echo "   - Web service (backend)"
echo "   - Static site (frontend)"
echo "   - Background worker (Celery)"
echo "4. Add GitHub secrets for CI/CD"
echo "5. Configure your domain (optional)"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Setup script completed!"
