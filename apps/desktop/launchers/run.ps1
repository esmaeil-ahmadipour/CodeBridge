# Thin launcher (Windows / PowerShell). No logic here: it only starts CodeBridge.
# Usage:  .\run.ps1 [codebridge arguments]      (no arguments = interactive menu)
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$exe  = Join-Path $here "codebridge-windows-x64.exe"
if (-not (Test-Path $exe)) { $exe = Join-Path $here "codebridge.exe" }
if (Test-Path $exe) { & $exe @args; exit $LASTEXITCODE }
if (Test-Path (Join-Path $here "..\src\codebridge")) {
  $env:PYTHONPATH = (Join-Path $here "..\src") + $(if ($env:PYTHONPATH) { ";$env:PYTHONPATH" })
}
$py = Get-Command py -ErrorAction SilentlyContinue
if (-not $py) { $py = Get-Command python -ErrorAction SilentlyContinue }
if ($py) { & $py.Source -m codebridge @args; exit $LASTEXITCODE }
Write-Error "CodeBridge binary not found next to this script and Python is not installed."
exit 1
