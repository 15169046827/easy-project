param()
. (Join-Path $PSScriptRoot 'sync-apifox-api.ps1') -Library
$webPath = Join-Path $repository 'docs/api/web-apifox-manifest.json'
$web = Get-Content $webPath -Raw | ConvertFrom-Json -AsHashtable -Depth 100
$spec = Get-Content (Join-Path $repository 'docs/api/web-openapi.json') -Raw | ConvertFrom-Json -AsHashtable -Depth 100
if ($web.projectId -ne 8948094 -or $web.branchId -ne 8751742 -or $web.interfaces.Count -ne 9) { throw 'Unexpected web API binding or inventory' }
foreach ($key in $web.interfaces.Keys) {
    $entry = $web.interfaces[$key]
    $detail = (Call-Apifox 'readEntityDetails' @{ projectId = 8948094; branchId = 8751742; entityType = 'endpoint'; entityId = $entry.id }).data.definition
    $actual = $detail.paths[$entry.path][$entry.method]
    $expected = $spec.paths[$entry.path][$entry.method]
    if (-not $actual -or $actual.summary -ne $expected.summary -or [string]$actual.description -ne [string]$expected.description -or -not $actual.responses.'200') { throw "HTTP contract mismatch: $key" }
    if ($entry.method -eq 'post') {
        if ('X-EasyProject-Request' -notin $actual.parameters.name -or 'Origin' -notin $actual.parameters.name) { throw "Missing CSRF boundary: $key" }
    }
    if ($expected.requestBody -and -not $actual.requestBody.content.'application/json'.schema) { throw "Missing request schema: $key" }
    $hash = Content-Hash ($detail | ConvertTo-Json -Depth 100 -Compress)
    if ($entry.sha256 -and $entry.sha256 -ne $hash) { throw "Remote HTTP API changed: $key" }
    $entry.sha256 = $hash
    Write-Output "VERIFIED HTTP $($entry.method) $($entry.path) id=$($entry.id)"
}
$pending = "$webPath.pending"
[IO.File]::WriteAllText($pending, ($web | ConvertTo-Json -Depth 100) + "`n", [Text.UTF8Encoding]::new($false))
[IO.File]::Move($pending, $webPath, $true)
