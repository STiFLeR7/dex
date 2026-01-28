# Setup script for Dex development
Write-Host "Setting up Dex Development Environment..."

# Create venv if not exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}

# Activate and install requirements
Write-Host "Installing dependencies..."
& .\venv\Scripts\pip install -r services\mcp_runtime\requirements.txt

Write-Host "Setup Complete. Activate venv with: .\venv\Scripts\Activate.ps1"
