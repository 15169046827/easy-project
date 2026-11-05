#Requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$DumpbinPath,
    [Parameter(Mandatory = $true)][string[]]$BinaryPath,
    [Parameter(Mandatory = $true)][string]$WebViewInstallerPath
)
$ErrorActionPreference = 'Stop'
$signature = Get-AuthenticodeSignature -LiteralPath $WebViewInstallerPath
if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch 'O=Microsoft Corporation') {
    throw 'WebView2 payload must have a valid Microsoft Authenticode signature.'
}
if ((Get-Item -LiteralPath $WebViewInstallerPath).Length -lt 50MB) {
    throw 'Expected a full offline runtime installer, not a small bootstrapper.'
}
foreach ($binary in $BinaryPath) {
    $imports = & $DumpbinPath /dependents $binary 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Dependency inspection failed: $binary" }
    $dlls = @($imports | ForEach-Object { if ($_ -match '^\s+([\w.-]+\.dll)\s*$') { $Matches[1] } })
    if ($dlls.Count -eq 0) { throw "No DLL imports found: $binary" }
    $external = @($dlls | Where-Object { $_ -match '^(vcruntime|msvcp|msvcr|sqlite|libssl|libcrypto|python|node|coreclr|hostfxr)' })
    if ($external.Count) { throw "New runtime dependency requires review: $($external -join ', ')" }
    [pscustomobject]@{ Binary = (Split-Path -Leaf $binary); Imports = $dlls }
}
[pscustomobject]@{
    RuntimeSignature = [string]$signature.Status
    RuntimePublisher = $signature.SignerCertificate.Subject
    RuntimeSHA256 = (Get-FileHash -LiteralPath $WebViewInstallerPath -Algorithm SHA256).Hash
    RuntimeBytes = (Get-Item -LiteralPath $WebViewInstallerPath).Length
}
