# Alpha Media prep — preserve full image (default), optional letterbox/crop
# Usage:  .\scripts\alpha-media-prep.ps1
#         .\scripts\alpha-media-prep.ps1 -Mode preserve
#         .\scripts\alpha-media-prep.ps1 -Mode letterbox   # dark bars, no cut
#         .\scripts\alpha-media-prep.ps1 -Mode crop        # center crop (not recommended for charts)
# SSOT: docs/A5_MEDIA_FLOWS_RUNBOOK.md

param(
    [string]$SourceDir = "G:\Other computers\My Computer\Project\hinh",
    [ValidateSet('preserve', 'letterbox', 'crop')]
    [string]$Mode = 'preserve',
    [string]$Date = (Get-Date -Format "yyyy-MM-dd"),
    [int]$JpegQuality = 90,
    [int]$MaxBytes = 5MB,
    [int]$MaxLongEdge = 1920,
    [string]$HeroHash = "3f1bc683853790f9d287b6cfa5469010"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$BgColor = [System.Drawing.Color]::FromArgb(18, 18, 22)

function Save-Jpeg {
    param([System.Drawing.Bitmap]$Bitmap, [string]$Path, [int]$Quality)
    $encoders = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
    $dir = Split-Path $Path -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $Bitmap.Save($Path, $encoders[0], $ep)
    $ep.Dispose()
}

function Export-PreserveJpeg {
    param([string]$SourcePath, [string]$DestPath, [int]$Quality, [int]$MaxEdge)
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $SourcePath))
    try {
        $w = $img.Width
        $h = $img.Height
        $long = [Math]::Max($w, $h)
        if ($long -gt $MaxEdge) {
            $scale = [double]$MaxEdge / [double]$long
            $w = [int][Math]::Round($w * $scale)
            $h = [int][Math]::Round($h * $scale)
        }
        $bmp = New-Object System.Drawing.Bitmap $w, $h
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $w, $h)
        $g.Dispose()
        Save-Jpeg -Bitmap $bmp -Path $DestPath -Quality $Quality
        $bmp.Dispose()
    } finally {
        $img.Dispose()
    }
    Shrink-IfOversize -SourcePath $SourcePath -DestPath $DestPath -Quality $Quality -MaxEdge $MaxEdge -Mode 'preserve'
}

function Export-CanvasJpeg {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [int]$TargetW,
        [int]$TargetH,
        [int]$Quality,
        [string]$FitMode,
        [int]$MaxEdge
    )
    $img = [System.Drawing.Image]::FromFile((Resolve-Path $SourcePath))
    try {
        $bmp = New-Object System.Drawing.Bitmap $TargetW, $TargetH
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.Clear($BgColor)

        if ($FitMode -eq 'crop') {
            $targetAspect = [double]$TargetW / [double]$TargetH
            $srcAspect = [double]$img.Width / [double]$img.Height
            if ($srcAspect -gt $targetAspect) {
                $cropW = [int][Math]::Round($img.Height * $targetAspect)
                $cropH = $img.Height
                $x = [int](($img.Width - $cropW) / 2)
                $y = 0
            } else {
                $cropW = $img.Width
                $cropH = [int][Math]::Round($img.Width / $targetAspect)
                $x = 0
                $y = [int](($img.Height - $cropH) / 2)
            }
            $srcRect = New-Object System.Drawing.Rectangle $x, $y, $cropW, $cropH
            $dstRect = New-Object System.Drawing.Rectangle 0, 0, $TargetW, $TargetH
            $g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        } else {
            $scale = [Math]::Min([double]$TargetW / $img.Width, [double]$TargetH / $img.Height)
            $newW = [int][Math]::Round($img.Width * $scale)
            $newH = [int][Math]::Round($img.Height * $scale)
            $dx = [int](($TargetW - $newW) / 2)
            $dy = [int](($TargetH - $newH) / 2)
            $g.DrawImage($img, $dx, $dy, $newW, $newH)
        }
        $g.Dispose()
        Save-Jpeg -Bitmap $bmp -Path $DestPath -Quality $Quality
        $bmp.Dispose()
    } finally {
        $img.Dispose()
    }
    Shrink-IfOversize -SourcePath $SourcePath -DestPath $DestPath -Quality ($Quality - 8) -MaxEdge $MaxEdge -Mode $FitMode -TargetW $TargetW -TargetH $TargetH
}

function Shrink-IfOversize {
    param(
        [string]$SourcePath, [string]$DestPath, [int]$Quality, [int]$MaxEdge,
        [string]$Mode, [int]$TargetW = 0, [int]$TargetH = 0
    )
    if ((Get-Item $DestPath).Length -le $MaxBytes) { return }
    if ($Quality -le 62) { return }
    Remove-Item $DestPath -Force
    if ($Mode -eq 'preserve') {
        Export-PreserveJpeg -SourcePath $SourcePath -DestPath $DestPath -Quality ($Quality - 10) -MaxEdge ($MaxEdge - 160)
    } else {
        Export-CanvasJpeg -SourcePath $SourcePath -DestPath $DestPath -TargetW $TargetW -TargetH $TargetH -Quality ($Quality - 10) -FitMode $Mode -MaxEdge $MaxEdge
    }
}

if (-not (Test-Path $SourceDir)) { Write-Error "SourceDir not found: $SourceDir" }

$inbox = Join-Path $SourceDir "00_inbox"
$readyFull = Join-Path $SourceDir "01_ready_jpg\full"
$readyX = Join-Path $SourceDir "01_ready_jpg\x_16x9"
$readyT = Join-Path $SourceDir "01_ready_jpg\threads_1x1"
$posted = Join-Path $SourceDir "02_posted"
$manifest = Join-Path $SourceDir "01_ready_jpg\manifest.json"

foreach ($d in @($inbox, $readyFull, $readyX, $readyT, $posted)) {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
}

$rootImages = Get-ChildItem -Path $SourceDir -File | Where-Object {
    $_.Extension -match '^\.(jpe?g|png|webp)$' -and $_.DirectoryName -eq $SourceDir
}
foreach ($f in $rootImages) {
    $dest = Join-Path $inbox $f.Name
    if (-not (Test-Path $dest)) { Move-Item -LiteralPath $f.FullName -Destination $dest }
}

$sources = Get-ChildItem -Path $inbox -File | Where-Object { $_.Extension -match '^\.(jpe?g|png)$' } | Sort-Object Name
if ($sources.Count -eq 0) {
    Write-Warning "No images in $inbox"
    exit 0
}

$entries = @()
$i = 1
foreach ($src in $sources) {
    $slug = if ($src.BaseName -like "*$HeroHash*") { "hero" } else { "{0:D2}" -f $i }
    $baseName = "alpha_{0}_{1}.jpg" -f $Date, $slug
    $fullPath = Join-Path $readyFull $baseName

    if ($Mode -eq 'preserve') {
        Export-PreserveJpeg -SourcePath $src.FullName -DestPath $fullPath -Quality $JpegQuality -MaxEdge $MaxLongEdge
        $xPath = $fullPath
        $tPath = $fullPath
        $xName = $baseName
        $tName = $baseName
    } else {
        $fit = if ($Mode -eq 'crop') { 'crop' } else { 'letterbox' }
        $xName = "alpha_x_16x9_{0}_{1}.jpg" -f $Date, $slug
        $tName = "alpha_threads_1x1_{0}_{1}.jpg" -f $Date, $slug
        $xPath = Join-Path $readyX $xName
        $tPath = Join-Path $readyT $tName
        Export-CanvasJpeg -SourcePath $src.FullName -DestPath $xPath -TargetW 1280 -TargetH 720 -Quality $JpegQuality -FitMode $fit -MaxEdge $MaxLongEdge
        Export-CanvasJpeg -SourcePath $src.FullName -DestPath $tPath -TargetW 1080 -TargetH 1080 -Quality $JpegQuality -FitMode $fit -MaxEdge $MaxLongEdge
        Export-PreserveJpeg -SourcePath $src.FullName -DestPath (Join-Path $readyFull $baseName) -Quality $JpegQuality -MaxEdge $MaxLongEdge
    }

    if ($Mode -eq 'preserve') {
        $entries += [ordered]@{
            index = $i
            source = $src.Name
            full = @{ path = $fullPath; name = $baseName; bytes = (Get-Item $fullPath).Length }
            note = "Same file for X and Threads; full frame, no crop"
            hero = ($src.BaseName -like "*$HeroHash*")
        }
    } else {
        $entries += [ordered]@{
            index = $i
            source = $src.Name
            full = @{ path = (Join-Path $readyFull $baseName); name = $baseName }
            x = @{ path = $xPath; name = $xName; bytes = (Get-Item $xPath).Length }
            threads = @{ path = $tPath; name = $tName; bytes = (Get-Item $tPath).Length }
            mode = $Mode
            hero = ($src.BaseName -like "*$HeroHash*")
        }
    }
    if ($src.BaseName -notlike "*$HeroHash*") { $i++ }
}

$hero = $entries | Where-Object { $_.hero } | Select-Object -First 1
$heroFile = if ($Mode -eq 'preserve') { $hero.full.name } else { $hero.x.name }

$manifestObj = [ordered]@{
    generated = (Get-Date).ToString("o")
    date = $Date
    mode = $Mode
    sourceDir = $SourceDir
    driveFolder = "https://drive.google.com/drive/folders/1IW_UN4hnezRWvF3RSNMmaUXcf9pdzwbv"
    recommendedHero = if ($hero) { $heroFile } else { $entries[0].full.name }
    nextStep = "Upload 01_ready_jpg/full to Zernio (preserve mode). Same file OK for X + Threads."
    files = $entries
}
$manifestObj | ConvertTo-Json -Depth 6 | Set-Content -Path $manifest -Encoding UTF8

if ($Mode -eq 'preserve') {
    $dep = "DEPRECATED: center-crop removed chart content. Use 01_ready_jpg\full\ instead."
    Set-Content -Path (Join-Path $readyX "_READ_full_folder.txt") -Value $dep -Encoding UTF8
    Set-Content -Path (Join-Path $readyT "_READ_full_folder.txt") -Value $dep -Encoding UTF8
}

Write-Host ''
Write-Host ('Done: {0} images, mode={1}' -f $entries.Count, $Mode) -ForegroundColor Green
if ($Mode -eq 'preserve') { Write-Host $readyFull } else { Write-Host $readyX; Write-Host $readyT }
Write-Host ('Hero: {0}' -f $manifestObj.recommendedHero) -ForegroundColor Cyan
if ($Mode -eq 'crop') {
    Write-Warning 'crop mode cuts chart edges — use preserve (default) or letterbox'
}
