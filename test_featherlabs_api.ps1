# PowerShell script to test featherlabs API
Write-Host "Testing featherlabs API..." -ForegroundColor Green

# API endpoint and headers
$uri = "https://api.featherlabs.online/v1/chat/completions"
$headers = @{
    "Authorization" = "Bearer sk-mWdmd2RtRTNm2ndAtceylQ"
    "Content-Type" = "application/json"
}

# Request body
$body = @{
    "model" = "GLM-5"
    "messages" = @(
        @{
            "role" = "user"
            "content" = "test"
        }
    )
} | ConvertTo-Json -Depth 3

try {
    Write-Host "Sending POST request to: $uri" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host "Response received:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Check if it's a web exception
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $statusDescription = $_.Exception.Response.StatusDescription
        Write-Host "HTTP Status: $statusCode $statusDescription" -ForegroundColor Red
        
        # Try to read the response content
        try {
            $responseStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseStream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody" -ForegroundColor Red
            
            # Try to parse JSON
            try {
                $json = $responseBody | ConvertFrom-Json
                Write-Host "Parsed Error: $($json.error.message)" -ForegroundColor Red
            } catch {
                Write-Host "Could not parse JSON response" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Could not read response body" -ForegroundColor Red
        }
    }
}