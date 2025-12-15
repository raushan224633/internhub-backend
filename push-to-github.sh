#!/bin/bash

echo "🚀 InternHub Backend - GitHub Push Script"
echo "=========================================="
echo ""

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✓ Remote 'origin' already exists"
    git remote -v
else
    echo "⚠️  No remote found. Please add your GitHub repository:"
    echo ""
    echo "Run this command:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/internhub-backend.git"
    echo ""
    echo "Or if you want to use SSH:"
    echo "git remote add origin git@github.com:YOUR_USERNAME/internhub-backend.git"
    exit 1
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Go to https://dashboard.render.com/"
    echo "2. Click 'New +' → 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Use these settings:"
    echo "   - Name: internhub-backend"
    echo "   - Environment: Node"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "5. Add environment variables from .env.example"
    echo ""
else
    echo ""
    echo "❌ Push failed! Please check the error above."
fi
