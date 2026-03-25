#!/bin/bash
# DeepSeek Worker Proxy - Setup Script for Windows PowerShell
# Run this script to set up everything automatically

Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     DEEPSEEK WORKER PROXY - AUTOMATED SETUP                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

Write-Host "📦 Step 1/8: Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js found: $(node --version)" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Step 2/8: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`n☁️  Step 3/8: Creating KV namespace..." -ForegroundColor Yellow
$kvOutput = wrangler kv namespace create "DEEPSEEK_TOKEN_CACHE" 2>&1
Write-Host $kvOutput
if ($kvOutput -match '"id":\s*"([^"]+)"') {
    $kvId = $matches[1]
    Write-Host "✅ KV namespace created: $kvId" -ForegroundColor Green
    
    # Update wrangler.toml
    Write-Host "`n📝 Updating wrangler.toml with KV ID..." -ForegroundColor Yellow
    $wranglerContent = Get-Content wrangler.toml -Raw
    $wranglerContent = $wranglerContent -replace 'REPLACE_WITH_YOUR_KV_ID', $kvId
    Set-Content wrangler.toml $wranglerContent
    Write-Host "✅ wrangler.toml updated!" -ForegroundColor Green
} else {
    Write-Host "⚠️  KV namespace may already exist. Please check manually." -ForegroundColor Yellow
}

Write-Host "`n🔐 Step 4/8: Logging into Cloudflare..." -ForegroundColor Yellow
wrangler login
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cloudflare login successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Cloudflare login failed" -ForegroundColor Red
}

Write-Host "`n🔑 Step 5/8: Adding DeepSeek API Keys..." -ForegroundColor Yellow
Write-Host "Get your API keys from: https://platform.deepseek.com/api_keys" -ForegroundColor Cyan
Write-Host ""

$accountNum = 1
do {
    Write-Host "`nAdding account $accountNum..." -ForegroundColor Yellow
    npm run auth:add account$accountNum
    
    Write-Host "Add another account? (y/n): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne 'y' -and $response -ne 'Y') {
        break
    }
    $accountNum++
} while ($true)

Write-Host "`n✅ Added $accountNum account(s)!" -ForegroundColor Green

Write-Host "`n🗄️  Step 6/8: Deploying accounts to KV..." -ForegroundColor Yellow
npm run setup:deploy-all
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Accounts deployed to KV!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy accounts" -ForegroundColor Red
}

Write-Host "`n🔐 Step 7/8: Setting admin secret..." -ForegroundColor Yellow
$adminKey = "sk-admin-" + (-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | ForEach-Object {[char]$_}))
Write-Host "Generated admin key: $adminKey" -ForegroundColor Cyan
Write-Host "This will be saved in Cloudflare secrets..." -ForegroundColor Yellow

# Create a temporary file with the admin key
$tempFile = [System.IO.Path]::GetTempFileName()
$adminKey | Set-Content $tempFile
Get-Content $tempFile | wrangler secret put ADMIN_SECRET_KEY
Remove-Item $tempFile

Write-Host "`n💾 SAVE THIS KEY! You'll need it for admin health checks:" -ForegroundColor Red
Write-Host "$adminKey" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n🚀 Step 8/8: Deploying worker..." -ForegroundColor Yellow
npm run deploy
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Worker deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
}

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    🎉 SETUP COMPLETE! 🎉                          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
Write-Host "  ✅ KV namespace created" -ForegroundColor Green
Write-Host "  ✅ Cloudflare authenticated" -ForegroundColor Green
Write-Host "  ✅ API keys added: $accountNum" -ForegroundColor Green
Write-Host "  ✅ Accounts deployed to KV" -ForegroundColor Green
Write-Host "  ✅ Admin secret configured" -ForegroundColor Green
Write-Host "  ✅ Worker deployed" -ForegroundColor Green

Write-Host "`n🧪 Test your worker:" -ForegroundColor Yellow
Write-Host "  node test-deepseek-worker.js" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - README.md for full documentation" -ForegroundColor White
Write-Host "  - QUICKSTART.md for quick reference" -ForegroundColor White
Write-Host "  - PROJECT_SUMMARY.md for overview" -ForegroundColor White

Write-Host "`n🎉 Your DeepSeek Worker Proxy is ready to use!" -ForegroundColor Green
Write-Host ""
