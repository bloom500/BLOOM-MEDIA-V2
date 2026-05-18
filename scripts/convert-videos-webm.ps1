# Batch-convert all MP4s in public/videos/ to WebM (VP9, CRF 32, no audio).
# Single-pass at quality target. AV1 would be smaller but encodes 5-10x slower.
# VP9 is the practical sweet spot. CRF 30-36 is the recommended quality range.
#
# Source MP4s are NOT deleted automatically. Verify the WebMs play in the
# browser, then prune the originals manually.

$ErrorActionPreference = 'Stop'

# Hard-coded path to the WinGet-installed binary so this works in any shell
# even before PATH is refreshed. Update if you reinstall ffmpeg elsewhere.
$ffmpeg = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"

if (-not (Test-Path $ffmpeg)) {
  Write-Error "ffmpeg not found at $ffmpeg - adjust the path in this script."
  exit 1
}

$videosDir = Join-Path $PSScriptRoot '..\public\videos'
$videosDir = (Resolve-Path $videosDir).Path

$mp4Files = Get-ChildItem -Path $videosDir -Filter '*.mp4' -File

if ($mp4Files.Count -eq 0) {
  Write-Host "No MP4 files in $videosDir"
  exit 0
}

Write-Host "Converting $($mp4Files.Count) MP4 file(s) to WebM (VP9, CRF 32, no audio)" -ForegroundColor Cyan

foreach ($file in $mp4Files) {
  $outPath = Join-Path $videosDir ($file.BaseName + '.webm')

  if (Test-Path $outPath) {
    Write-Host "  - $($file.Name) already converted, skipping" -ForegroundColor DarkGray
    continue
  }

  Write-Host "  - $($file.Name) => $($file.BaseName).webm" -ForegroundColor Yellow

  & $ffmpeg `
    -hide_banner -loglevel warning -stats `
    -i $file.FullName `
    -c:v libvpx-vp9 -crf 32 -b:v 0 `
    -row-mt 1 -deadline good -cpu-used 2 `
    -pix_fmt yuv420p -an `
    -y $outPath

  if ($LASTEXITCODE -ne 0) {
    Write-Error "ffmpeg failed on $($file.Name)"
    exit 1
  }

  $origMB = [math]::Round($file.Length / 1MB, 2)
  $newMB  = [math]::Round((Get-Item $outPath).Length / 1MB, 2)
  $saved  = [math]::Round((1 - $newMB / $origMB) * 100, 1)
  Write-Host ("      {0} MB -> {1} MB  ({2}% smaller)" -f $origMB, $newMB, $saved) -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. Verify in the browser, then delete the .mp4 originals manually." -ForegroundColor Cyan
