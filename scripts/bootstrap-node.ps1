param(
  [Parameter(Mandatory = $true)][string]$Version,
  [Parameter(Mandatory = $true)][string]$Dest
)

# 下载并解压官方 Node.js 到项目 .tools 目录（免安装、不需要管理员权限）
$ErrorActionPreference = 'Stop'
$name = "node-v$Version-win-x64"
$target = Join-Path $Dest $name
$nodeExe = Join-Path $target 'node.exe'

if (Test-Path $nodeExe) {
  Write-Host "      [ok] Node.js v$Version 已存在于 $target"
  exit 0
}

New-Item -ItemType Directory -Force -Path $Dest | Out-Null

$file = "$name.zip"
$mirrors = @(
  "https://registry.npmmirror.com/-/binary/node/v$Version/$file",
  "https://cdn.npmmirror.com/binaries/node/v$Version/$file",
  "https://nodejs.org/dist/v$Version/$file"
)

$zip = Join-Path $Dest $file
$downloaded = $false
foreach ($url in $mirrors) {
  Write-Host "      [..] 下载 / downloading: $url"
  try {
    Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -TimeoutSec 600
    $downloaded = $true
    break
  } catch {
    Write-Host "      [warn] 该镜像失败，尝试下一个 / mirror failed, trying next"
  }
}

if (-not $downloaded) {
  Write-Host "      [error] 所有镜像均下载失败，请检查网络，或手动安装 Node.js v$Version"
  Write-Host "              https://nodejs.org/zh-cn/download"
  exit 1
}

Write-Host "      [..] 解压 / extracting..."
Expand-Archive -Path $zip -DestinationPath $Dest -Force
Remove-Item $zip -Force -ErrorAction SilentlyContinue

if (-not (Test-Path $nodeExe)) {
  Write-Host "      [error] 解压后未找到 node.exe"
  exit 1
}

Write-Host "      [ok] Node.js v$Version 已安装到 $target"
exit 0
