param([switch]$Apply, [string]$ResumeFrom)
$applyGrouping = $Apply
. (Join-Path $PSScriptRoot 'sync-apifox-api.ps1') -Library
$layout = Get-Content (Join-Path $repository 'docs/api/apifox-layout.json') -Raw | ConvertFrom-Json -Depth 100
if (-not $manifest.folders) { $manifest.folders = @{} }
if (-not $manifest.interfaces) { $manifest.interfaces = @{} }
if ($ResumeFrom -and $ResumeFrom -notin $layout.interfaces.key) { throw 'Unknown resume interface.' }
function Dynamic-Call($Id, $Path, $Body, [bool]$Write) {
    $requestArguments = @{ id = $Id; pathParams = $Path; queryParams = @{}; headers = @{ 'X-Project-Id' = '8948094' } }
    if ($null -ne $Body) { $requestArguments.body = $Body }
    return Call-Apifox 'executeOpenApi' $requestArguments $Write
}
$remoteFolders = (Dynamic-Call '00a468815ec90da0' @{} $null $false).data
foreach ($folder in $layout.folders) {
    $parentId = if ($folder.parent) { $manifest.folders[$folder.parent].id } else { $layout.rootFolderId }
    $state = $manifest.folders[$folder.key]
    if ($state) {
        $actual = $remoteFolders | Where-Object id -EQ $state.id
        $expectedParent = if ($parentId -eq $layout.rootFolderId) { 0 } else { $parentId }
        if (-not $actual -or $actual.name -ne $folder.name -or $actual.parentId -ne $expectedParent) { throw "Folder changed: $($folder.key)" }
        continue
    }
    if ($remoteFolders | Where-Object { $_.name -eq $folder.name -and ($_.parentId -eq $parentId -or ($parentId -eq $layout.rootFolderId -and $_.parentId -eq 0)) }) { throw "Unmanaged folder collision: $($folder.name)" }
    if (-not $applyGrouping) { Write-Output "PLAN folder $($folder.key)"; continue }
    if (-not $parentId) { throw 'Missing verified parent folder ID' }
    $result = Dynamic-Call 'a669aaa8a7136b83' @{} @{ name = $folder.name; parentId = [string]$parentId; type = 'api' } $true
    if (-not $result.data.id) { throw 'Folder creation outcome unclear; inspect before retry.' }
    $manifest.folders[$folder.key] = @{ id = $result.data.id; name = $folder.name; parentId = $parentId }
    Save-Manifest
    $remoteFolders = (Dynamic-Call '00a468815ec90da0' @{} $null $false).data
    $verified = $remoteFolders | Where-Object id -EQ $result.data.id
    $expectedParent = if ($parentId -eq $layout.rootFolderId) { 0 } else { $parentId }
    if (-not $verified -or $verified.name -ne $folder.name -or $verified.parentId -ne $expectedParent) { throw "Folder readback mismatch: $($folder.key)" }
    Write-Output "CREATED folder $($folder.key) id=$($result.data.id)"
}
$existing = (Dynamic-Call 'aa85350f4c6df684' @{ projectId = '8948094' } $null $false).data
$resumeReached = [string]::IsNullOrEmpty($ResumeFrom)
foreach ($item in $layout.interfaces) {
    $state = $manifest.interfaces[$item.key]
    $folderId = $manifest.folders[$item.group].id
    $hash = Content-Hash $item.content
    if ($item.key -eq $ResumeFrom) { $resumeReached = $true }
    if (-not $resumeReached) {
        if (-not $state.id -or $state.sha256 -ne $hash -or $state.folderId -ne $folderId) {
            throw "Cannot skip an unverified interface: $($item.key)"
        }
        continue
    }
    $actual = $null
    if ($state) {
        $actual = (Dynamic-Call 'd2430159b28e4551' @{ projectId = '8948094'; id = [string]$state.id } $null $false).data
        if ($state.sha256 -and (Content-Hash $actual.content) -ne $state.sha256) { throw "Interface changed: $($item.key)" }
        if ((Content-Hash $actual.content) -eq $hash -and $actual.folderId -eq $folderId -and $actual.protocol -eq $item.protocol -and $actual.path -eq $item.path -and $actual.name -eq $item.name) {
            if (-not $state.sha256 -and $applyGrouping) { $state.sha256 = $hash; Save-Manifest }
            Write-Output "UNCHANGED interface $($item.key)"
            continue
        }
        if (-not $state.sha256) { throw "Unverified interface: $($item.key)" }
    } elseif ($existing | Where-Object path -EQ $item.path) { throw "Unmanaged interface collision: $($item.path)" }
    if (-not $applyGrouping) { Write-Output "PLAN interface $($item.key)"; continue }
    if (-not $folderId) { throw 'Missing verified destination folder' }
    $path = @{ projectId = '8948094' }
    if ($state) { $path.id = [string]$state.id }
    $result = Dynamic-Call $(if ($state) { '0a1b56c981b3e8fc' } else { '1cbdd18b600ccea1' }) $path @{
        name = $item.name; protocol = $item.protocol; path = $item.path
        folderId = [int]$folderId; content = $item.content; status = $(if ($item.status) { $item.status } else { 'released' }); tags = @('EasyProject', $item.protocol)
    } $true
    $id = if ($state) { $state.id } else { $result.data.id }
    if (-not $id) { throw 'Interface write outcome unclear; inspect before retry' }
    $manifest.interfaces[$item.key] = @{ id = $id; name = $item.name; folderId = $folderId; sha256 = $null }
    Save-Manifest
    $read = (Dynamic-Call 'd2430159b28e4551' @{ projectId = '8948094'; id = [string]$id } $null $false).data
    if ((Content-Hash $read.content) -ne $hash -or $read.folderId -ne $folderId -or $read.protocol -ne $item.protocol -or $read.path -ne $item.path -or $read.name -ne $item.name) { throw "Interface readback mismatch: $($item.key)" }
    $manifest.interfaces[$item.key].sha256 = $hash
    Save-Manifest
    Write-Output "VERIFIED interface $($item.key) id=$id"
}
foreach ($key in $manifest.documents.Keys) {
    $state = $manifest.documents[$key]
    $group = if ($key -in @('overview', 'models')) { 'guide' } elseif ($key.StartsWith('easyproject_')) { 'archive.mcp' } else { 'archive.ipc' }
    $folderId = $manifest.folders[$group].id
    $actual = (Call-Apifox 'readEntityDetails' @{ projectId = 8948094; branchId = 8751742; entityType = 'markdown'; entityId = $state.id }).data
    if ((Content-Hash $actual.definition) -ne $state.sha256) { throw "Markdown edited remotely: $key" }
    $remoteDoc = (Dynamic-Call '2c83ef72f52ed483' @{ docId = [string]$state.id } $null $false).data
    if ((Content-Hash $remoteDoc.content) -ne $state.sha256) { throw "Reference readback mismatch: $key" }
    if ($folderId -and $remoteDoc.folderId -eq $folderId) { continue }
    if (-not $applyGrouping) { Write-Output "PLAN move reference $key"; continue }
    $null = Dynamic-Call 'fa8695f8e5037106' @{ doc_id = [string]$state.id } @{ name = $state.name; content = $actual.definition; folderId = [string]$folderId } $true
    $read = (Dynamic-Call '2c83ef72f52ed483' @{ docId = [string]$state.id } $null $false).data
    if ((Content-Hash $read.content) -ne $state.sha256 -or $read.folderId -ne $folderId -or $read.name -ne $state.name) { throw "Reference move readback mismatch: $key" }
    $state.folderId = $folderId
    Save-Manifest
    Write-Output "MOVED reference $key"
}
