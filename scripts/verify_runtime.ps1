# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Error "Virtual environment not found. Please run setup_dev.ps1."
    exit 1
}

# Activate venv and run health check
& .\venv\Scripts\Activate.ps1

$job = Start-Job -ScriptBlock {
    Set-Location "d:\dex"
    & .\venv\Scripts\uvicorn.exe services.mcp_runtime.main:app --port 8001
}

Write-Host "Waiting for service to start..."
Start-Sleep -Seconds 10

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/" -ErrorAction Stop
    Write-Host "Service Health Check: $($response.status)"
    if ($response.status -eq "ok") {
        Write-Host "VERIFICATION PASSED"
    } else {
        Write-Host "VERIFICATION FAILED: Unexpected status"
    }
} catch {
    Write-Host "VERIFICATION FAILED: Service not reachable"
    Write-Error $_
} finally {
    Stop-Job $job
    Remove-Job $job -Force
}
