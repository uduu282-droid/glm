#!/bin/bash

# Test script for Image World King Worker
# Run this after deploying locally to test all endpoints

WORKER_URL="http://localhost:8787"

echo "🧪 Testing Image World King Worker"
echo "=================================="
echo ""

# Test 1: Health Check
echo "📍 Test 1: Health Check"
curl -s "$WORKER_URL/health" | jq '.'
echo ""
echo ""

# Test 2: Generate Image - Simple Prompt
echo "📍 Test 2: Generate Image (Simple)"
RESULT=$(curl -s "$WORKER_URL/api/generate?prompt=a%20cute%20cat")
echo "$RESULT" | jq '.'

# Check if successful
if echo "$RESULT" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ SUCCESS!"
    IMAGE_URL=$(echo "$RESULT" | jq -r '.image_url')
    echo "🖼️  Image URL: $IMAGE_URL"
else
    echo "❌ FAILED"
    ERROR=$(echo "$RESULT" | jq -r '.error // .message')
    echo "Error: $ERROR"
fi
echo ""
echo ""

# Test 3: Generate Image - Complex Prompt
echo "📍 Test 3: Generate Image (Complex)"
RESULT=$(curl -s "$WORKER_URL/api/generate?prompt=a%20mystical%20forest%20with%20glowing%20plants")
echo "$RESULT" | jq '.'

if echo "$RESULT" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ SUCCESS!"
    IMAGE_URL=$(echo "$RESULT" | jq -r '.image_url')
    echo "🖼️  Image URL: $IMAGE_URL"
else
    echo "❌ FAILED"
fi
echo ""
echo ""

# Test 4: Missing Prompt (Should Fail)
echo "📍 Test 4: Missing Prompt (Should Return Error)"
RESULT=$(curl -s "$WORKER_URL/api/generate")
echo "$RESULT" | jq '.'

if echo "$RESULT" | jq -e '.error' > /dev/null 2>&1; then
    echo "✅ Correctly returned error"
else
    echo "⚠️  Should have returned an error"
fi
echo ""
echo ""

# Test 5: Stats Endpoint
echo "📍 Test 5: Usage Statistics"
curl -s "$WORKER_URL/stats" | jq '.'
echo ""
echo ""

# Test 6: Invalid Endpoint (Should Return 404)
echo "📍 Test 6: Invalid Endpoint (Should Return 404)"
curl -s -w "\nHTTP Status: %{http_code}\n" "$WORKER_URL/invalid"
echo ""
echo ""

# Summary
echo "=================================="
echo "📊 Test Summary"
echo "=================================="
echo "All tests completed!"
echo ""
echo "Check the output above for details."
echo "If all tests passed, your worker is working correctly! ✅"
echo ""
