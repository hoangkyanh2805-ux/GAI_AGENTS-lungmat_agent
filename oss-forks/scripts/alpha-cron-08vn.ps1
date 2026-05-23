# Alpha factory — 08:00 Asia/Ho_Chi_Minh (Task Scheduler)
# Action: powershell -File "...\oss-forks\scripts\alpha-cron-08vn.ps1"

$ErrorActionPreference = "Stop"
$repo = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not $repo) { $repo = "g:\Other computers\My Computer\Project\GAI_AGENTS-lungmat_agent" }

# Prefer Python POC (stable on Windows)
$pyFactory = Join-Path $repo "services\alpha-factory"
if (Test-Path $pyFactory) {
  Set-Location $pyFactory
  if (Test-Path ".\.venv\Scripts\python.exe") {
    & .\.venv\Scripts\python.exe main.py
  } else {
    py -3 main.py
  }
  exit $LASTEXITCODE
}

# Fallback: LC fork pack CLI (needs yarn + .env in fork)
$lc = Join-Path $repo "oss-forks\social-media-agent-lungmat"
Set-Location $lc
yarn lungmat:pack
