param([switch]$Apply, [string]$ResumeFrom, [string[]]$OnlyOperations)
$applyWeb = $Apply
. (Join-Path $PSScriptRoot 'sync-apifox-api.ps1') -Library
$webPath = Join-Path $repository 'docs/api/web-apifox-manifest.json'
$web = Get-Content $webPath -Raw | ConvertFrom-Json -AsHashtable -Depth 100
$spec = Get-Content (Join-Path $repository 'docs/api/web-openapi.json') -Raw | ConvertFrom-Json -AsHashtable -Depth 100
if ($web.projectId -ne 8948094 -or $web.branchId -ne 8751742 -or $web.rootFolderId -ne 97929320) { throw 'Unexpected Web project binding.' }
if ($OnlyOperations | Where-Object { -not $web.interfaces.Contains($_) }) { throw 'Unknown targeted Web operation.' }
function Save-WebManifest {
    $pending = "$webPath.pending"
    [IO.File]::WriteAllText($pending, ($web | ConvertTo-Json -Depth 100) + "`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::Move($pending, $webPath, $true)
}
function Read-WebDefinition($Id) {
    return (Call-Apifox 'readEntityDetails' @{projectId=8948094;branchId=8751742;entityType='endpoint';entityId=$Id}).data.definition
}
# Check every managed entity before any write. Never overwrite an external edit.
foreach ($state in $web.interfaces.Values) {
    $actual = Read-WebDefinition $state.id
    if (-not $state.sha256 -or (Content-Hash ($actual | ConvertTo-Json -Depth 100 -Compress)) -ne $state.sha256) { throw "Remote Web contract changed: $($state.id)" }
}
$existing = (Call-Apifox 'getStructureInfo' @{projectId=8948094;branchId=8751742;entityType='endpoint'}).data.entities
$missing = [ordered]@{}
$resumeReached = [string]::IsNullOrEmpty($ResumeFrom)
if ($ResumeFrom -and -not $web.interfaces.Contains($ResumeFrom)) { throw 'Unknown resume operation.' }
foreach ($path in $spec.paths.Keys) {
    foreach ($method in $spec.paths[$path].Keys) {
        $op = $spec.paths[$path][$method]
        if (-not $web.interfaces[$op.operationId]) {
            if ($existing | Where-Object { $_.path -eq $path -and $_.method -eq $method }) { throw "Unmanaged HTTP collision: $method $path" }
            if (-not $missing[$path]) { $missing[$path] = [ordered]@{} }
            $missing[$path][$method] = $op
        }
    }
}
if (-not $applyWeb) { Write-Output "PLAN Web new paths=$($missing.Count); managed=$($web.interfaces.Count)"; return }
if ($OnlyOperations.Count -and $missing.Count) { throw 'Targeted updates cannot import new endpoints.' }
if (-not $web.folders.profile) {
    $folders = (Call-Apifox 'executeOpenApi' @{id='00a468815ec90da0';pathParams=@{};queryParams=@{};headers=@{'X-Project-Id'='8948094'}}).data
    if ($folders | Where-Object { $_.name -eq '用户资料' -and $_.parentId -eq $web.rootFolderId }) { throw 'Unmanaged profile folder collision.' }
    $created = Call-Apifox 'executeOpenApi' @{id='a669aaa8a7136b83';pathParams=@{};queryParams=@{};headers=@{'X-Project-Id'='8948094'};body=@{name='用户资料';parentId=[string]$web.rootFolderId;type='api'}} $true
    if (-not $created.data.id) { throw 'Folder outcome unclear; inspect before retry.' }
    $web.folders.profile = @{id=$created.data.id;name='用户资料'}
    Save-WebManifest
}
if ($missing.Count) {
    $additive = [ordered]@{openapi=$spec.openapi;info=$spec.info;security=$spec.security;components=$spec.components;paths=$missing}
    $null = Call-Apifox 'importData' @{headers=@{'X-Project-Id'='8948094'};pathParams=@{projectId='8948094'};body=@{importFormat='openapi';data=($additive | ConvertTo-Json -Depth 100 -Compress);apiOverwriteMode='ignore';schemaOverwriteMode='ignore';apiFolderId=$web.rootFolderId;syncApiFolder=$false}} $true
    $existing = (Call-Apifox 'getStructureInfo' @{projectId=8948094;branchId=8751742;entityType='endpoint'}).data.entities
    foreach ($path in $missing.Keys) {
        foreach ($method in $missing[$path].Keys) {
            $op = $missing[$path][$method]
            $found = @($existing | Where-Object { $_.path -eq $path -and $_.method -eq $method })
            if ($found.Count -ne 1) { throw 'Import result ambiguous; inspect before retry.' }
            $detail = Read-WebDefinition $found[0].entityId
            $web.interfaces[$op.operationId] = @{id=$found[0].entityId;path=$path;method=$method;name=$op.summary;sha256=(Content-Hash ($detail | ConvertTo-Json -Depth 100 -Compress))}
            Save-WebManifest
        }
    }
}
foreach ($path in $spec.paths.Keys) {
    foreach ($method in $spec.paths[$path].Keys) {
        $op = $spec.paths[$path][$method]
        $state = $web.interfaces[$op.operationId]
        if ($OnlyOperations.Count -and $op.operationId -notin $OnlyOperations) { continue }
        if ($op.operationId -eq $ResumeFrom) { $resumeReached = $true }
        if (-not $resumeReached) { continue }
        $raw = (Call-Apifox 'getHttpEndpoint' @{headers=@{'X-Project-Id'='8948094'};pathParams=@{projectId=8948094;httpApiId=$state.id}}).data
        if ($raw.path -ne $path -or $raw.method -ne $method) { throw 'HTTP identity changed.' }
        $group = switch ($op.'x-easyproject-group') {
            '用户资料' { 'profile' }
            '认证与会话' { 'auth' }
            '账号管理' { 'admin' }
            '工作区' { 'workspace' }
            '运行状态' { 'operations' }
            '用户MCP凭据' { 'account' }
            '远端MCP传输' { 'mcp' }
            default { throw 'Unknown Web API group.' }
        }
        $request = $raw.requestBody
        if ($op.requestBody) {
            $request = @{type='application/json';required=[bool]$op.requestBody.required;jsonSchema=$op.requestBody.content.'application/json'.schema;parameters=@()}
        }
        $responses = @()
        foreach ($code in $op.responses.Keys) {
            $response = $raw.responses | Where-Object { [string]$_.code -eq [string]$code } | Select-Object -First 1
            if (-not $response) {
                if ([int]$code -notin @(503, 507)) { throw "Expected imported response missing: $code" }
                $response = @{ name = $op.responses[$code].description; code = [int]$code; contentType = 'json' }
            }
            $response.description = $op.responses[$code].description
            $content = $op.responses[$code].content.'application/json'
            if ($content) { $response.jsonSchema = $content.schema }
            $responses += $response
        }
        $folder = $web.folders[$group].id
        if (-not $folder) { throw 'Missing managed HTTP folder.' }
        $null = Call-Apifox 'updateHttpEndpoint' @{headers=@{'X-Project-Id'='8948094'};pathParams=@{http_api_id=$state.id};body=@{name=$op.summary;description=[string]$op.description;status='testing';folderId=$folder;requestBody=($request | ConvertTo-Json -Depth 100 -Compress);responses=($responses | ConvertTo-Json -Depth 100 -Compress)}} $true
        $readback = (Call-Apifox 'getHttpEndpoint' @{headers=@{'X-Project-Id'='8948094'};pathParams=@{projectId=8948094;httpApiId=$state.id}}).data
        if ($readback.folderId -ne $folder -or $readback.status -ne 'testing' -or $readback.name -ne $op.summary) { throw 'HTTP write readback mismatch.' }
        $state.folderId = $folder
        $state.name = $op.summary
        $detail = Read-WebDefinition $state.id
        $state.sha256 = Content-Hash ($detail | ConvertTo-Json -Depth 100 -Compress)
        Save-WebManifest
        Write-Output "UPDATED HTTP $method $path id=$($state.id)"
    }
}
& (Join-Path $PSScriptRoot 'verify-web-apifox.ps1')
