#Requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$expectedSid = 'S-1-5-21-3591474116-2237436791-2944630817-1008'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
if ($identity.User.Value -ne $expectedSid) {
    throw 'Run this script after signing in to EasyProjectTest; installation refused for this account.'
}
if ([Security.Principal.WindowsPrincipal]::new($identity).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Use a normal, non-administrator PowerShell window.'
}

$repository = Split-Path -Parent $PSScriptRoot
$installer = Join-Path $repository 'src-tauri\target\audit-tools\release-37715193321\EasyProject_0.1.0_windows_x64-setup.exe'
$expectedHash = 'FA56B80EC8B95B5C66A69D3032CF82C103C8AB8F84B716D64A3249141B5F394E'
if ((Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash -ne $expectedHash) {
    throw 'Installer SHA256 mismatch.'
}

$dataDirectory = Join-Path ([Environment]::GetFolderPath('ApplicationData')) 'com.easyproject.desktop'
if (Test-Path -LiteralPath $dataDirectory) {
    throw 'Existing application data found; first-install test refused.'
}
$uninstallRoots = @(
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
)
if (Get-ItemProperty -Path $uninstallRoots -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -match 'EasyProject' }) {
    throw 'Existing EasyProject installation found; replacement refused.'
}

# Do not allow this test to install a shared WebView runtime on the system drive.
$webViewId = '{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
$webViewKeys = @(
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\$webViewId",
    "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\$webViewId",
    "HKCU:\Software\Microsoft\EdgeUpdate\Clients\$webViewId"
)
$installedRuntime = Get-ItemProperty -LiteralPath $webViewKeys -ErrorAction SilentlyContinue | Where-Object { $_.pv -and $_.pv -ne '0.0.0.0' }
if (-not $installedRuntime) {
    throw 'An existing WebView2 runtime is required; no shared runtime installation is authorized.'
}

$installDirectory = Join-Path $repository 'src-tauri\target\audit-tools\runtime-EasyProjectTest\app'
if (Test-Path -LiteralPath $installDirectory) {
    throw 'Test install directory already exists; overwrite refused.'
}
New-Item -ItemType Directory -Path $installDirectory -ErrorAction Stop | Out-Null
$process = Start-Process -FilePath $installer -ArgumentList @('/S', "/D=$installDirectory") -WindowStyle Hidden -PassThru -Wait
if ($process.ExitCode -ne 0) {
    throw "Installer failed with exit code $($process.ExitCode); preserve the test directory for diagnosis."
}
$executable = Join-Path $installDirectory 'easy-project.exe'
if (-not (Test-Path -LiteralPath $executable)) {
    throw 'Installer returned success but the application executable is missing.'
}
[pscustomobject]@{
    Account = $identity.Name
    InstallDirectory = $installDirectory
    ProductVersion = (Get-Item -LiteralPath $executable).VersionInfo.ProductVersion
    ApplicationDataDirectory = $dataDirectory
    Launched = $false
}
