$Root = Split-Path $PSScriptRoot -Parent
$Bin = Join-Path $Root "tools\pgsql\bin"
$DataDir = Join-Path $Root "data\postgres"
$env:Path = "$Bin;$env:Path"
& "$Bin\pg_ctl.exe" -D $DataDir stop
