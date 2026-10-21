# Monthly StatCan + Job Bank outlook update (called by Windows Task Scheduler)
# Uses $env:PYTHON_BIN if set (falls back to "python" on PATH)
$ErrorActionPreference = "Continue"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$py = if ($env:PYTHON_BIN) { $env:PYTHON_BIN } else { "python" }
Set-Location $dir
Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] monthly update start"
& $py -X utf8 "$dir\scripts\update_statcan.py"
Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] monthly update done"
