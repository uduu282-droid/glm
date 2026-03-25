# MU-Devs API Test - PowerShell Implementation
# Reverse engineered from https://mu-devs.vercel.app/

$baseUrl = "https://mu-devs.vercel.app"
$endpoint = "/generate"

Write-Host "🎨 MU-Devs Image Generator Test" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Get prompt from user
$prompt = Read-Host "Enter image prompt (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($prompt)) {
    $prompt = "A futuristic cyberpunk city at night with neon lights"
}

# Get model selection
Write-Host "`nSelect model:" -ForegroundColor Yellow
Write-Host "1. flux (default)" -ForegroundColor White
Write-Host "2. fluxpro" -ForegroundColor White
$modelChoice = Read-Host "Enter choice (1 or 2)"

if ($modelChoice -eq "2") {
    $model = "fluxpro"
} else {
    $model = "flux"
}

Write-Host "`n🚀 Generating image..." -ForegroundColor Green
Write-Host "Prompt: $prompt" -ForegroundColor Gray
Write-Host "Model: $model" -ForegroundColor Gray
Write-Host "=" * 50 -ForegroundColor Gray

try {
    # Prepare request
    $payload = @{
        prompt = $prompt
        model = $model
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    # Make request
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method Post -Headers $headers -Body $payload

    # Check response
    if ($response.success) {
        Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
        Write-Host "📷 Image URL: $($response.image_url)" -ForegroundColor Cyan
        
        # Ask if user wants to open in browser
        $openBrowser = Read-Host "`nOpen image in browser? (y/n)"
        if ($openBrowser -eq "y" -or $openBuffer -eq "Y") {
            Start-Process $response.image_url
        }
    } else {
        Write-Host "`n❌ API Error:" -ForegroundColor Red
        Write-Host $($response.error) -ForegroundColor Yellow
    }

} catch {
    Write-Host "`n❌ Request Failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Gray
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}

Write-Host "`n" + "=" * 50 -ForegroundColor Gray
Write-Host "Test complete!" -ForegroundColor Cyan
