# LangGraph local - Alpha fork (Windows, no global yarn)
# Usage: powershell -ExecutionPolicy Bypass -File oss-forks\scripts\langgraph-dev.ps1

$ErrorActionPreference = "Stop"
$repo = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$lc = Join-Path $repo "oss-forks\social-media-agent-lungmat"

if (-not (Test-Path (Join-Path $lc ".env"))) {
  Copy-Item (Join-Path $repo "oss-forks\.env.alpha.example") (Join-Path $lc ".env")
  Write-Host "Created .env - fill ANTHROPIC_API_KEY, FIRECRAWL_API_KEY, N8N_WEBHOOK_URL"
}

$fac = Join-Path $repo "services\alpha-factory\.env"
if (Test-Path $fac) {
  $kv = @{}
  Get-Content $fac | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') { $kv[$matches[1].Trim()] = $matches[2].Trim() }
  }
  $lines = Get-Content (Join-Path $lc ".env")
  $out = $lines | ForEach-Object {
    if ($_ -match '^ANTHROPIC_API_KEY=' -and $kv['ANTHROPIC_API_KEY']) { "ANTHROPIC_API_KEY=$($kv['ANTHROPIC_API_KEY'])" }
    elseif ($_ -match '^N8N_WEBHOOK_URL=' -and $kv['N8N_WEBHOOK_URL']) { "N8N_WEBHOOK_URL=$($kv['N8N_WEBHOOK_URL'])" }
    else { $_ }
  }
  $out | Set-Content (Join-Path $lc ".env") -Encoding utf8
}

Set-Location $lc
Write-Host "Starting LangGraph dev on http://localhost:54367"
Write-Host 'Studio: https://smith.langchain.com/studio?baseUrl=http://localhost:54367'
npx --yes @langchain/langgraph-cli@latest dev --port 54367
