# Minify Firebase Service Account JSON
# This script converts ServiceAccountKey.json to a single-line format for Render deployment

Write-Host "Firebase JSON Minifier" -ForegroundColor Cyan
Write-Host "======================`n" -ForegroundColor Cyan

# Check if file exists
$filePath = ".\backend\ServiceAccountKey.json"
if (-not (Test-Path $filePath)) {
    Write-Host "Error: ServiceAccountKey.json not found in backend folder!" -ForegroundColor Red
    Write-Host "Please make sure the file exists at: $filePath" -ForegroundColor Yellow
    exit 1
}

# Read and parse JSON
Write-Host "Reading $filePath..." -ForegroundColor Yellow
$json = Get-Content $filePath -Raw | ConvertFrom-Json

# Minify (compress to single line)
Write-Host "Minifying JSON..." -ForegroundColor Yellow
$minified = $json | ConvertTo-Json -Compress -Depth 100

# Copy to clipboard
$minified | Set-Clipboard

# Success message
Write-Host "`nSuccess! Minified JSON copied to clipboard!`n" -ForegroundColor Green

# Show preview (first 150 characters)
Write-Host "Preview (first 150 characters):" -ForegroundColor Cyan
$previewLength = [Math]::Min(150, $minified.Length)
Write-Host ($minified.Substring(0, $previewLength) + "...") -ForegroundColor Gray

# Show total length
Write-Host "`nTotal length: $($minified.Length) characters" -ForegroundColor Cyan

# Instructions
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://dashboard.render.com/" -ForegroundColor White
Write-Host "2. Click your 'cyberbuddy-backend' service" -ForegroundColor White
Write-Host "3. Go to 'Environment' tab (left sidebar)" -ForegroundColor White
Write-Host "4. Click 'Add Environment Variable'" -ForegroundColor White
Write-Host "5. Set:" -ForegroundColor White
Write-Host "   - Key: FIREBASE_CREDENTIALS_JSON" -ForegroundColor Cyan
Write-Host "   - Value: Paste (Ctrl+V)" -ForegroundColor Cyan
Write-Host "6. Click 'Save Changes'" -ForegroundColor White
Write-Host "`nRender will automatically redeploy your backend!" -ForegroundColor Green
