#Requires -Version 5.1
#Requires -RunAsAdministrator
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$testSid = 'S-1-5-21-3591474116-2237436791-2944630817-1008'
$testAccount = Get-LocalUser -Name EasyProjectTest -ErrorAction SilentlyContinue
if ($testAccount -and $testAccount.SID.Value -ne $testSid) { throw 'Test account SID mismatch.' }
$testProfile = Get-CimInstance Win32_UserProfile | Where-Object { $_.SID -eq $testSid }
if ($testProfile -and ($testProfile.Loaded -or $testProfile.LocalPath -ne 'C:\Users\EasyProjectTest')) {
    throw 'Unexpected or loaded test profile; cleanup refused.'
}
if (Get-Process -Name easy-project,EasyProject -ErrorAction SilentlyContinue) { throw 'Close EasyProject before cleanup.' }

$dataTargets = @(
    'C:\Users\Canace\AppData\Roaming\com.easyproject.desktop',
    'C:\Users\Canace\AppData\Local\com.easyproject.desktop'
)
foreach ($target in $dataTargets) {
    if (Test-Path -LiteralPath $target) {
        $resolved = (Resolve-Path -LiteralPath $target).Path
        if ($resolved -ne $target) { throw 'Unexpected resolved data path.' }
        $items = @((Get-Item -LiteralPath $target)) + @(Get-ChildItem -LiteralPath $target -Force -Recurse)
        if ($items | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) {
            throw 'Data contains a link; recursive cleanup refused.'
        }
    }
}
if ($testProfile) {
    $profileItem = Get-Item -LiteralPath $testProfile.LocalPath
    if ($profileItem.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Test profile is a link.' }
    $testProfile | Remove-CimInstance
}
if ($testAccount) { Remove-LocalUser -Name EasyProjectTest }
foreach ($target in $dataTargets) {
    if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Recurse -Force }
}
$legacyFile = 'E:\Project\Project\easy-project\db\project_manager.db'
if (Test-Path -LiteralPath $legacyFile) {
    if ((Get-Item -LiteralPath $legacyFile).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Legacy database is a link.' }
    Remove-Item -LiteralPath $legacyFile -Force
}
