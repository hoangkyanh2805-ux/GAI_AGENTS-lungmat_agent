# LangGraph dev from C:\dev copy (stable node_modules on local disk)
# First time: run oss-forks\scripts\sync-langgraph-to-cdev.ps1 then yarn install in C:\dev\social-media-agent-lungmat
# Usage: powershell -ExecutionPolicy Bypass -File oss-forks\scripts\langgraph-dev-c-dev.ps1

$ErrorActionPreference = "Stop"
$lc = "C:\dev\social-media-agent-lungmat"
$repo = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

if (-not (Test-Path $lc)) {
  Write-Host "Missing $lc — run sync-langgraph-to-cdev.ps1 first"
  exit 1
}

$fac = Join-Path $repo "services\alpha-factory\.env"
$envPath = Join-Path $lc ".env"
if (-not (Test-Path $envPath)) {
  Copy-Item (Join-Path $repo "oss-forks\.env.alpha.example") $envPath
}
if (Test-Path $fac) {
  $kv = @{}
  Get-Content $fac | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') { $kv[$matches[1].Trim()] = $matches[2].Trim() }
  }
  $lines = Get-Content $envPath
  $out = $lines | ForEach-Object {
    if ($_ -match '^ANTHROPIC_API_KEY=' -and $kv['ANTHROPIC_API_KEY']) { "ANTHROPIC_API_KEY=$($kv['ANTHROPIC_API_KEY'])" }
    elseif ($_ -match '^N8N_WEBHOOK_URL=' -and $kv['N8N_WEBHOOK_URL']) { "N8N_WEBHOOK_URL=$($kv['N8N_WEBHOOK_URL'])" }
    else { $_ }
  }
  $out | Set-Content $envPath -Encoding utf8
}

Set-Location $lc
Write-Host "LangGraph dev: $lc"
Write-Host "http://localhost:54367"
npx --yes @langchain/langgraph-cli@latest dev --port 54367
