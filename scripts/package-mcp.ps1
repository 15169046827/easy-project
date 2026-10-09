param([switch]$SkipBuild)

$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskTarget = if ($env:CARGO_TARGET_DIR) { $env:CARGO_TARGET_DIR } else { Join-Path $taskRoot 'src-tauri/target' }
if (-not $SkipBuild) {
    & cargo build --manifest-path (Join-Path $taskRoot 'src-tauri/Cargo.toml') --locked --release --bin easyproject-mcp
    if ($LASTEXITCODE -ne 0) { throw 'MCP release build failed' }
}
$taskBinary = Join-Path $taskTarget 'release/easyproject-mcp.exe'
if (-not (Test-Path -LiteralPath $taskBinary -PathType Leaf)) { throw 'Windows MCP release binary is missing' }
$taskOutput = Join-Path $taskRoot 'artifacts/mcp'
New-Item -ItemType Directory -Path $taskOutput -Force | Out-Null
Copy-Item -LiteralPath $taskBinary -Destination (Join-Path $taskOutput 'easyproject-mcp.exe') -Force
Copy-Item -LiteralPath (Join-Path $taskRoot 'docs/MCP.md') -Destination (Join-Path $taskOutput 'MCP.md') -Force
$taskCommit = & git -C $taskRoot rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw 'Cannot identify source commit' }
$taskDirty = @(& git -C $taskRoot status --porcelain).Count -ne 0
$taskManifest = [ordered]@{
    sourceCommit = $taskCommit
    worktreeDirty = $taskDirty
    platform = 'windows-x64'
    transport = 'stdio'
    defaultPermissions = 'read-only'
    automaticInstallation = $false
    sha256 = (Get-FileHash -LiteralPath (Join-Path $taskOutput 'easyproject-mcp.exe') -Algorithm SHA256).Hash
    createdAt = [DateTime]::UtcNow.ToString('o')
}
$taskManifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskOutput 'manifest.json') -Encoding UTF8
Write-Output "MCP delivery ready: $taskOutput"
Write-Output "SHA256: $($taskManifest.sha256)"
