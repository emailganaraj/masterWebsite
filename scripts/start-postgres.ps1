$Root = Split-Path $PSScriptRoot -Parent
$Bin = Join-Path $Root "tools\pgsql\bin"
$DataDir = Join-Path $Root "data\postgres"
$env:Path = "$Bin;$env:Path"
& "$Bin\pg_ctl.exe" -D $DataDir -l (Join-Path $DataDir "server.log") start
Start-Sleep -Seconds 2
& "$Bin\pg_isready.exe" -h localhost -p 5432
