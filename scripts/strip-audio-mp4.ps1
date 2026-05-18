# Strip audio from MP4 videos in public/videos without re-encoding video.
# iOS autoplay-muted policy is stricter than the spec: a video that has
# an audio track (even silent, even with `muted` attribute) sometimes
# triggers the "tap to play" UI on iOS Chrome/Safari. Removing the audio
# track entirely is the most reliable fix.
#
# `-c:v copy -an` rewrites the container without re-encoding video, so
# this is fast and lossless.

$ErrorActionPreference = 'Stop'

$ffmpeg = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
if (-not (Test-Path $ffmpeg)) {
  Write-Error "ffmpeg not found at $ffmpeg"
  exit 1
}

$videosDir = (Resolve-Path (Join-Path $PSScriptRoot '..\public\videos')).Path
$mp4 = Get-ChildItem -Path $videosDir -Filter '*.mp4' -File

Write-Host "Stripping audio from $($mp4.Count) MP4(s) in-place" -ForegroundColor Cyan

foreach ($f in $mp4) {
  $tmp = Join-Path $videosDir ($f.BaseName + '.noaudio.tmp.mp4')
  Write-Host "  - $($f.Name)" -ForegroundColor Yellow

  & $ffmpeg `
    -hide_banner -loglevel error -stats `
    -i $f.FullName `
    -c:v copy -an `
    -movflags +faststart `
    -y $tmp

  if ($LASTEXITCODE -ne 0) {
    Write-Error "ffmpeg failed on $($f.Name)"
    if (Test-Path $tmp) { Remove-Item $tmp -Force }
    exit 1
  }

  $orig = $f.Length
  $new = (Get-Item $tmp).Length
  Move-Item -Force $tmp $f.FullName
  Write-Host ("    {0:N2} MB -> {1:N2} MB" -f ($orig/1MB), ($new/1MB)) -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. iOS autoplay-muted should now succeed." -ForegroundColor Cyan
