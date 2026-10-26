param([switch]$AcceptExpectedUpdate)
. (Join-Path $PSScriptRoot 'sync-apifox-api.ps1') -Library
$webPath = Join-Path $repository 'docs/api/web-apifox-manifest.json'
$web = Get-Content $webPath -Raw | ConvertFrom-Json -AsHashtable -Depth 100
$spec = Get-Content (Join-Path $repository 'docs/api/web-openapi.json') -Raw | ConvertFrom-Json -AsHashtable -Depth 100
$expectedIds = @($spec.paths.Values | ForEach-Object { $_.Values } | ForEach-Object { $_.operationId })
if ($web.projectId -ne 8948094 -or $web.branchId -ne 8751742 -or
    $web.interfaces.Count -ne $expectedIds.Count -or
    @($expectedIds | Select-Object -Unique).Count -ne $expectedIds.Count -or
    @($expectedIds | Where-Object { -not $_ -or -not $web.interfaces.Contains($_) }).Count) {
    throw 'Unexpected web API binding or inventory'
}
function Normalize-Schema($Value) {
    if ($Value -is [System.Collections.IDictionary]) {
        $result = [ordered]@{}
        foreach ($name in ($Value.Keys | Sort-Object)) {
            if ($name -notlike 'x-apifox-*') { $result[$name] = Normalize-Schema $Value[$name] }
        }
        return $result
    }
    if ($Value -is [array]) { return ,@($Value | ForEach-Object { Normalize-Schema $_ }) }
    return $Value
}
$locations = @{}
foreach ($folder in $web.folders.Values) {
    $entities = (Call-Apifox 'getStructureInfo' @{ projectId=8948094; branchId=8751742; entityType='endpoint'; folderId=$folder.id }).data.entities
    foreach ($entity in $entities) {
        $locations[[string]$entity.entityId] = $folder.id
    }
}
foreach ($key in $web.interfaces.Keys) {
    $entry = $web.interfaces[$key]
    if ($locations[[string]$entry.id] -ne $entry.folderId) { throw "HTTP grouping mismatch: $key" }
    # The structure search can retain stale status after update; verify the
    # authoritative HTTP entity as well, rather than accepting the write response.
    $raw = (Call-Apifox 'getHttpEndpoint' @{headers=@{'X-Project-Id'='8948094'};pathParams=@{projectId=8948094;httpApiId=$entry.id}}).data
    if ($raw.status -ne 'testing' -or $raw.folderId -ne $entry.folderId) { throw "HTTP state mismatch: $key" }
    $detail = (Call-Apifox 'readEntityDetails' @{ projectId = 8948094; branchId = 8751742; entityType = 'endpoint'; entityId = $entry.id }).data.definition
    $actual = $detail.paths[$entry.path][$entry.method]
    $expected = $spec.paths[$entry.path][$entry.method]
    if (-not $actual -or $actual.summary -ne $expected.summary -or [string]$actual.description -ne [string]$expected.description) { throw "HTTP contract mismatch: $key" }
    foreach ($code in $expected.responses.Keys) { if (-not $actual.responses[$code]) { throw "Missing response $code for $key" } }
    foreach ($code in $expected.responses.Keys) {
        $schema = $expected.responses[$code].content.'application/json'.schema
        if ($schema) {
            $expectedResponse = Normalize-Schema $schema | ConvertTo-Json -Depth 100 -Compress
            $actualResponse = Normalize-Schema $actual.responses[$code].content.'application/json'.schema | ConvertTo-Json -Depth 100 -Compress
            if ($expectedResponse -ne $actualResponse) { throw "Response schema mismatch: $code $key" }
        }
    }
    if ($entry.method -eq 'post' -and $entry.path -ne '/mcp') {
        if ('X-EasyProject-Request' -notin $actual.parameters.name -or 'Origin' -notin $actual.parameters.name) { throw "Missing CSRF boundary: $key" }
    }
    if ($expected.requestBody -and -not $actual.requestBody.content.'application/json'.schema) { throw "Missing request schema: $key" }
    if ($expected.requestBody) {
        $expectedSchema = Normalize-Schema $expected.requestBody.content.'application/json'.schema | ConvertTo-Json -Depth 100 -Compress
        $actualSchema = Normalize-Schema $actual.requestBody.content.'application/json'.schema | ConvertTo-Json -Depth 100 -Compress
        if ($expectedSchema -ne $actualSchema) { throw "Request schema mismatch: $key" }
    }
    $hash = Content-Hash ($detail | ConvertTo-Json -Depth 100 -Compress)
    if ($entry.sha256 -and $entry.sha256 -ne $hash -and -not $AcceptExpectedUpdate) { throw "Remote HTTP API changed: $key" }
    $entry.sha256 = $hash
    Write-Output "VERIFIED HTTP $($entry.method) $($entry.path) id=$($entry.id)"
}
$pending = "$webPath.pending"
[IO.File]::WriteAllText($pending, ($web | ConvertTo-Json -Depth 100) + "`n", [Text.UTF8Encoding]::new($false))
[IO.File]::Move($pending, $webPath, $true)
