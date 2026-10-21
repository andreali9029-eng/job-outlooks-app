# Job Bank job-count daily snapshot: scrape + refresh front-end data
# Uses $env:PYTHON_BIN if set (falls back to "python" on PATH)
$py  = if ($env:PYTHON_BIN) { $env:PYTHON_BIN } else { "python" }
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] scraping job counts..."
& $py -X utf8 "$dir\scripts\scrape_jobcount.py"
$code = $LASTEXITCODE
if ($code -ne 0) { Write-Output "scrape failed with exit $code"; exit $code }

Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] refreshing front-end data..."
& $py -X utf8 "$dir\scripts\build_jobcount_latest.py"
& $py -X utf8 "$dir\scripts\build_jobcount_history.py"
Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] done"
