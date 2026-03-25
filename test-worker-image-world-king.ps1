# Test script for Image World King Worker (PowerShell)
# Run this after deploying locally to test all endpoints

$WORKER_URL = "http://localhost:8787"

Write-Host "🧪 Testing Image World King Worker" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "📍 Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$WORKER_URL/health" -Method Get
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# Test 2: Generate Image - Simple Prompt
Write-Host "📍 Test 2: Generate Image (Simple)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$WORKER_URL/api/generate?prompt=a%20cute%20cat" -Method Get
    $response | ConvertTo-Json
    
    if ($response.success) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "🖼️  Image URL: $($response.image_url)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "Error: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# Test 3: Generate Image - Complex Prompt
Write-Host "📍 Test 3: Generate Image (Complex)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$WORKER_URL/api/generate?prompt=a%20mystical%20forest%20with%20glowing%20plants" -Method Get
    $response | ConvertTo-Json
    
    if ($response.success) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "🖼️  Image URL: $($response.image_url)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# Test 4: Missing Prompt (Should Fail)
Write-Host "📍 Test 4: Missing Prompt (Should Return Error)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$WORKER_URL/api/generate" -Method Get
    $response | ConvertTo-Json
    
    if ($response.error) {
        Write-Host "✅ Correctly returned error" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Should have returned an error" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✅ Correctly returned error: $_" -ForegroundColor Green
}
Write-Host ""
Write-Host ""

# Test 5: Stats Endpoint
Write-Host "📍 Test 5: Usage Statistics" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$WORKER_URL/stats" -Method Get
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# Test 6: Invalid Endpoint (Should Return 404)
Write-Host "📍 Test 6: Invalid Endpoint (Should Return 404)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$WORKER_URL/invalid" -Method Get -UseBasicParsing
    Write-Host "HTTP Status: $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    Write-Host "✅ Correctly returned error (Status: $($_.Exception.Response.StatusCode.Value__))" -ForegroundColor Green
}
Write-Host ""
Write-Host ""

# Summary
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Check the output above for details."
Write-Host "If all tests passed, your worker is working correctly! ✅" -ForegroundColor Green
Write-Host ""
