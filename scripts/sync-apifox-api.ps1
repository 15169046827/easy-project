param([switch]$Apply, [switch]$Library)
$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
$manifestPath = Join-Path $repository 'docs/api/apifox-manifest.json'
$documents = Get-Content (Join-Path $repository 'docs/api/apifox-documents.json') -Raw | ConvertFrom-Json -Depth 100
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json -AsHashtable -Depth 100
$helper = Join-Path $PSScriptRoot 'apifox-mcp.ps1'
function Call-Apifox($Tool, $Arguments, [bool]$Write = $false) {
    $response = & $helper -Tool $Tool -ArgumentsJson ($Arguments | ConvertTo-Json -Depth 100 -Compress) -AllowWrite:$Write
    if ($response.error -or $response.result.isError) { throw "Apifox $Tool rejected; no automatic retry." }
    $value = ($response.result.content | Where-Object type -EQ 'text' | ForEach-Object text) -join "`n"
    $parsed = $value | ConvertFrom-Json -AsHashtable -Depth 100
    if ($parsed.ContainsKey('success') -and -not $parsed.success) { throw "Apifox $Tool failed; no automatic retry." }
    return $parsed
}
function Content-Hash([string]$Content) {
    $bytes = [Text.Encoding]::UTF8.GetBytes($Content.Replace("`r`n", "`n"))
    return [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()
}
function Save-Manifest {
    # Generated synchronization state, never credentials or API response bodies.
    $pendingPath = "$manifestPath.pending"
    [IO.File]::WriteAllText($pendingPath, ($manifest | ConvertTo-Json -Depth 100) + "`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::Move($pendingPath, $manifestPath, $true)
}
if ($manifest.projectId -ne 8948094 -or $manifest.branchId -ne 8751742) { throw 'Unexpected project binding.' }
if ($Library) { return }
$current = Call-Apifox 'getStructureInfo' @{ projectId = 8948094; branchId = 8751742; entityType = 'markdown' }
foreach ($document in $documents) {
    $state = $manifest.documents[$document.key]
    $hash = Content-Hash $document.content
    $exists = $null
    if ($state) {
        $exists = (Call-Apifox 'readEntityDetails' @{ projectId = 8948094; branchId = 8751742; entityType = 'markdown'; entityId = $state.id }).data
        if ($state.sha256 -and (Content-Hash $exists.definition) -ne $state.sha256) { throw "Remote document changed: $($document.key). Review before overwriting." }
        if ((Content-Hash $exists.definition) -eq $hash) {
            if (-not $state.sha256 -and $Apply) {
                $manifest.documents[$document.key].sha256 = $hash
                Save-Manifest
            }
            Write-Output "UNCHANGED $($document.key) id=$($state.id)"
            continue
        }
        if (-not $state.sha256) { throw "Unverified remote state: $($document.key). Read and confirm before updating." }
    } elseif ($current.data.entities | Where-Object name -EQ $document.name) {
        throw "Unmanaged document with matching name: $($document.name). Read and bind manually."
    }
    if (-not $Apply) { Write-Output "PLAN $($document.key)"; continue }
    $operation = if ($state) { 'fa8695f8e5037106' } else { '12efa5c42b296c7c' }
    $path = if ($state) { @{ doc_id = [string]$state.id } } else { @{} }
    $result = Call-Apifox 'executeOpenApi' @{
        id = $operation; pathParams = $path; queryParams = @{}
        headers = @{ 'X-Project-Id' = '8948094' }
        body = @{ name = $document.name; content = $document.content; folderId = $(if ($state.folderId) { $state.folderId } else { 0 }) }
    } $true
    $id = if ($state) { $state.id } else { $result.data.id }
    if (-not $id) { throw 'Write outcome has no ID; inspect remote state before retrying.' }
    $manifest.documents[$document.key] = @{ id = $id; name = $document.name; sha256 = $null; folderId = $(if ($state.folderId) { $state.folderId } else { 0 }) }
    Save-Manifest
    $readback = (Call-Apifox 'readEntityDetails' @{ projectId = 8948094; branchId = 8751742; entityType = 'markdown'; entityId = $id }).data
    if ((Content-Hash $readback.definition) -ne $hash) { throw "Readback mismatch: $($document.key)" }
    $manifest.documents[$document.key].sha256 = $hash
    Save-Manifest
    Write-Output "VERIFIED $($document.key) id=$id"
}
