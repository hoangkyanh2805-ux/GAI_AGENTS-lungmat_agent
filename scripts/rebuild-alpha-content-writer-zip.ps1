# Rebuild GoClaw skill ZIP
$ErrorActionPreference = "Stop"
$repo = Resolve-Path (Join-Path $PSScriptRoot "..")
$skillDir = Join-Path $repo "docs\goclaw-export\skills\alpha-content-writer"
$zipOut = Join-Path $repo "docs\goclaw-export\skills\zips\alpha-content-writer.zip"

if (-not (Test-Path (Join-Path $skillDir "SKILL.md"))) {
    Write-Error "SKILL.md not found: $skillDir"
}
New-Item -ItemType Directory -Path (Split-Path $zipOut) -Force | Out-Null
if (Test-Path $zipOut) { Remove-Item $zipOut -Force }
Compress-Archive -Path (Join-Path $skillDir "*") -DestinationPath $zipOut -Force
Write-Host "Built: $zipOut"
