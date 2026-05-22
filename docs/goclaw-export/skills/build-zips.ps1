# Build ZIP files for GoClaw skill upload
# Run: cd docs/goclaw-export/skills && pwsh build-zips.ps1

$skills = @(
    "media-os-orchestrator",
    "alpha-content-writer",
    "linh-cau-community",
    "alpha-cskh-1to1",
    "raymond-content-writer",
    "vip10x-content-writer",
    "lung-mat-coach"
)

$outDir = "$PSScriptRoot\zips"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

foreach ($skill in $skills) {
    $src = "$PSScriptRoot\$skill"
    $zip = "$outDir\$skill.zip"
    if (Test-Path $zip) { Remove-Item $zip -Force }
    Compress-Archive -Path "$src\*" -DestinationPath $zip
    Write-Host "OK  $skill.zip"
}

Write-Host "`nDone. Upload folder: $outDir"
