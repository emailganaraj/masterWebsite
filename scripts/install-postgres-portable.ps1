# Portable PostgreSQL installer — no admin rights required
# Installs to D:\masterWebsite\tools\pgsql, data in D:\masterWebsite\data\postgres

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$ToolsDir = Join-Path $Root "tools\pgsql"
$DataDir = Join-Path $Root "data\postgres"
$ZipPath = Join-Path $Root "tools\postgresql-binaries.zip"
$PgUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.6-1-windows-x64-binaries.zip"

Write-Host "=== Portable PostgreSQL Setup ===" -ForegroundColor Cyan
Write-Host "Install dir: $ToolsDir"
Write-Host "Data dir:    $DataDir"

New-Item -ItemType Directory -Path (Join-Path $Root "tools") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $Root "data") -Force | Out-Null

if (-not (Test-Path (Join-Path $ToolsDir "bin\initdb.exe"))) {
    if (-not (Test-Path $ZipPath)) {
        Write-Host "Downloading PostgreSQL 16 binaries (~50 MB)..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $PgUrl -OutFile $ZipPath -UseBasicParsing
    }
    Write-Host "Extracting..."
    Expand-Archive -Path $ZipPath -DestinationPath (Join-Path $Root "tools") -Force
    $extracted = Get-ChildItem (Join-Path $Root "tools") -Directory | Where-Object { $_.Name -like "pgsql*" } | Select-Object -First 1
    if ($extracted -and $extracted.FullName -ne $ToolsDir) {
        if (Test-Path $ToolsDir) { Remove-Item $ToolsDir -Recurse -Force }
        Rename-Item $extracted.FullName "pgsql"
    }
}

$Bin = Join-Path $ToolsDir "bin"
if (-not (Test-Path (Join-Path $Bin "initdb.exe"))) {
    throw "PostgreSQL binaries not found after extract. Check $ToolsDir"
}

$env:Path = "$Bin;$env:Path"

if (-not (Test-Path (Join-Path $DataDir "PG_VERSION"))) {
    Write-Host "Initializing database cluster..."
    & "$Bin\initdb.exe" -D $DataDir -U postgres -A trust -E UTF8 --locale=C
}

$pidFile = Join-Path $DataDir "postmaster.pid"
$running = $false
if (Test-Path $pidFile) {
    try {
        $null = & "$Bin\pg_isready.exe" -h localhost -p 5432 2>$null
        if ($LASTEXITCODE -eq 0) { $running = $true }
    } catch { }
}

if (-not $running) {
    Write-Host "Starting PostgreSQL on port 5432..."
    & "$Bin\pg_ctl.exe" -D $DataDir -l (Join-Path $DataDir "server.log") start
    Start-Sleep -Seconds 3
}

& "$Bin\pg_isready.exe" -h localhost -p 5432
if ($LASTEXITCODE -ne 0) { throw "PostgreSQL failed to start. Check $DataDir\server.log" }

Write-Host "Creating app user and database..."
$env:PGPASSWORD = "masterwebsite_dev"
& "$Bin\psql.exe" -h localhost -p 5432 -U postgres -d postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='masterwebsite'" | ForEach-Object {
    if ($_.Trim() -ne "1") {
        & "$Bin\psql.exe" -h localhost -p 5432 -U postgres -d postgres -c "CREATE USER masterwebsite WITH PASSWORD 'masterwebsite_dev' CREATEDB;"
    }
}
& "$Bin\psql.exe" -h localhost -p 5432 -U postgres -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='masterwebsite'" | ForEach-Object {
    if ($_.Trim() -ne "1") {
        & "$Bin\psql.exe" -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE masterwebsite OWNER masterwebsite;"
    }
}

Write-Host ""
Write-Host "PostgreSQL is ready!" -ForegroundColor Green
Write-Host "  Connection: postgresql://masterwebsite:masterwebsite_dev@localhost:5432/masterwebsite"
Write-Host "  Start:      .\scripts\start-postgres.ps1"
Write-Host "  Stop:       .\scripts\stop-postgres.ps1"
