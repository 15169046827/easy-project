#Requires -Version 5.1
#Requires -RunAsAdministrator
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$accountName = 'EasyProjectTest'

if (Get-LocalUser -Name $accountName -ErrorAction SilentlyContinue) {
    throw "Account $accountName already exists; no changes were made."
}

# A disabled standard account has no usable login until the owner sets a password.
# Generate the initial secret only in memory; never print or persist it.
$randomBytes = New-Object byte[] 32
$randomGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
try {
    $randomGenerator.GetBytes($randomBytes)
    $initialPassword = ConvertTo-SecureString ([Convert]::ToBase64String($randomBytes) + 'aA1!') -AsPlainText -Force
    $testUser = New-LocalUser -Name $accountName -Password $initialPassword -Disabled -Description 'EasyProject isolated internal-build test account' -AccountExpires (Get-Date).AddDays(30)
    $standardGroup = Get-LocalGroup -SID 'S-1-5-32-545'
    Add-LocalGroupMember -Group $standardGroup -Member $testUser
    Get-LocalUser -Name $accountName | Select-Object Name, Enabled, AccountExpires
}
finally {
    [Array]::Clear($randomBytes, 0, $randomBytes.Length)
    $randomGenerator.Dispose()
    if ($initialPassword) { $initialPassword.Dispose() }
}
