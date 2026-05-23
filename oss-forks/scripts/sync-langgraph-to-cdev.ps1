# One-time sync: repo fork -> C:\dev\social-media-agent-lungmat (no node_modules)
$ErrorActionPreference = "Stop"
$repo = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$src = Join-Path $repo "oss-forks\social-media-agent-lungmat"
$dst = "C:\dev\social-media-agent-lungmat"
New-Item -ItemType Directory -Force -Path "C:\dev" | Out-Null
$envBackup = $null
if (Test-Path (Join-Path $dst ".env")) { $envBackup = Get-Content (Join-Path $dst ".env") -Raw }
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
robocopy $src $dst /E /XD node_modules .git /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
Copy-Item (Join-Path $repo "oss-forks\prompts") (Join-Path $dst "oss-forks-prompts") -Recurse -Force
if ($envBackup) { Set-Content (Join-Path $dst ".env") $envBackup -Encoding utf8 }
Write-Host "Synced to $dst"
Write-Host "Next: cd $dst && npx yarn@1.22.22 install"
