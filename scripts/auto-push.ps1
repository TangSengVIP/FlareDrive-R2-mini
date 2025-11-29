Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-CurrentBranch {
  try { (git rev-parse --abbrev-ref HEAD).Trim() } catch { return $null }
}

function HasChanges {
  try {
    $out = git status --porcelain
    return -not [string]::IsNullOrWhiteSpace($out)
  } catch { return $false }
}

Write-Host "[auto-push] 启动自动同步到 GitHub (每10秒检测一次变更)"
$branch = Get-CurrentBranch
if (-not $branch) {
  Write-Host "[auto-push] 未检测到Git分支，请先执行 git init / 添加远程 / 创建分支" -ForegroundColor Yellow
}

while ($true) {
  if (HasChanges) {
    try {
      git add -A
      $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
      $msg = "chore: 自动同步 $timestamp"
      git commit -m $msg | Out-Null
      git push | Out-Null
      Write-Host "[auto-push] 已推送: $msg"
    } catch {
      Write-Host "[auto-push] 推送失败: $($_.Exception.Message)" -ForegroundColor Red
    }
  }
  Start-Sleep -Seconds 10
}

