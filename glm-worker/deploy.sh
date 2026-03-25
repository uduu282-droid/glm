#!/bin/bash
# GLM-5 Worker Deployment Script
# Automates the entire deployment process

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════╗"
echo "║     GLM-5 Cloudflare Worker Deployment              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if wrangler is installed globally, if not use npx
if command -v wrangler &> /dev/null; then
    WRANGLER_CMD="wrangler"
else
    WRANGLER_CMD="npx wrangler"
    echo "ℹ️  Using npx wrangler (no global installation required)"
fi

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Step 2: Check if logged into Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if [ ! -f ~/.config/.wrangler/state/default.toml ]; then
    echo "⚠️  Not logged into Cloudflare"
    echo "📱 Opening browser for login..."
    $WRANGLER_CMD login
    
    if [ $? -eq 0 ]; then
        echo "✅ Logged into Cloudflare"
    else
        echo "❌ Login failed"
        exit 1
    fi
else
    echo "✅ Already logged into Cloudflare"
fi

echo ""

# Step 3: Deploy
echo "🚀 Deploying to Cloudflare Workers..."
$WRANGLER_CMD deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║          🎉 DEPLOYMENT SUCCESSFUL!                  ║"
    echo "╚══════════════════════════════════════════════════════╝"
    echo ""
    echo "Your worker is now live at:"
    echo "https://glm-worker-proxy.<your-subdomain>.workers.dev"
    echo ""
    echo "Next steps:"
    echo "1. Test with: node verify.js"
    echo "2. Run full tests: node test-worker.js"
    echo "3. Use with OpenAI SDK or any HTTP client"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
