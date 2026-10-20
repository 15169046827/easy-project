param(
    [string]$Tool,
    [string]$ArgumentsJson = '{}',
    [switch]$ListTools,
    [switch]$AllowWrite
)

# Credential values remain in memory and are sent only to Apifox's official host.
$ErrorActionPreference = 'Stop'
$arguments = $ArgumentsJson | ConvertFrom-Json -AsHashtable -Depth 100
if ($Tool -and $Tool -ne 'listAccessibleProjects') {
    $projects = @($arguments.projectId, $arguments.pathParams.projectId, $arguments.headers.'X-Project-Id') | Where-Object { $_ }
    if ($projects | Where-Object { [string]$_ -ne '8948094' }) { throw 'Only EasyProject 8948094 is in scope.' }
    $project = $projects | Select-Object -First 1
    if ($Tool -eq 'executeOpenApi') {
        $readIds = @('aa85350f4c6df684', 'd2430159b28e4551', '9738c601d6498b0a', '2c83ef72f52ed483')
        $writeIds = @('1cbdd18b600ccea1', '0a1b56c981b3e8fc', '12efa5c42b296c7c', 'fa8695f8e5037106')
        if ($arguments.id -notin ($readIds + $writeIds)) { throw 'OpenAPI operation has not been reviewed.' }
        if ([string]$project -ne '8948094') { throw 'An explicit EasyProject binding is required.' }
        if ($arguments.id -in $writeIds -and -not $AllowWrite) { throw 'Document writes require -AllowWrite.' }
    } elseif ($Tool -notin @('getProjectSummary', 'getStructureInfo', 'readEntityDetails', 'listOpenApiEndpoints', 'getOpenApiDetails')) {
        throw 'This helper only supports reviewed API-document maintenance tools.'
    }
}
$apifoxCredential = [Environment]::GetEnvironmentVariable('ApiFox_MCP_TOKEN', 'Process')
if ([string]::IsNullOrWhiteSpace($apifoxCredential)) {
    $apifoxCredential = [Environment]::GetEnvironmentVariable('ApiFox_MCP_TOKEN', 'User')
}
if ([string]::IsNullOrWhiteSpace($apifoxCredential)) { throw 'ApiFox_MCP_TOKEN is unavailable.' }
$apifoxHeaders = @{
    Authorization = 'Bearer ' + $apifoxCredential
    'X-Apifox-Api-Version' = '2025-09-01'
    Accept = 'application/json, text/event-stream'
}

function Send-ApifoxMessage($Message) {
    try {
        $response = Invoke-WebRequest -Uri 'https://api.apifox.com/mcp' -Method Post `
            -Headers $apifoxHeaders -ContentType 'application/json' `
            -Body ($Message | ConvertTo-Json -Depth 100 -Compress) `
            -MaximumRedirection 0 -TimeoutSec 45 -ErrorAction Stop
    } catch {
        # Do not emit exception/request objects that could contain auth headers.
        $status = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        throw "Apifox MCP request failed (HTTP $status); credentials were not logged."
    }
    if ($response.Headers['Mcp-Session-Id']) {
        $apifoxHeaders['Mcp-Session-Id'] = [string]$response.Headers['Mcp-Session-Id']
    }
    $raw = [string]$response.Content
    if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
    if ($raw -match '(?m)^data:') {
        $raw = (($raw -split "`n" | Where-Object { $_ -like 'data:*' }) |
            ForEach-Object { $_.Substring(5).Trim() }) -join "`n"
    }
    return $raw | ConvertFrom-Json -Depth 100
}

$init = Send-ApifoxMessage @{
    jsonrpc = '2.0'; id = 1; method = 'initialize'
    params = @{ protocolVersion = '2025-06-18'; capabilities = @{}
        clientInfo = @{ name = 'EasyProject-API-maintenance'; version = '1.0' } }
}
if ($init.error) { throw 'Apifox MCP initialization rejected.' }
$apifoxHeaders['MCP-Protocol-Version'] = $init.result.protocolVersion
$null = Send-ApifoxMessage @{ jsonrpc = '2.0'; method = 'notifications/initialized' }
if ($ListTools) {
    Send-ApifoxMessage @{ jsonrpc = '2.0'; id = 2; method = 'tools/list'; params = @{} }
} elseif ($Tool) {
    Send-ApifoxMessage @{
        jsonrpc = '2.0'; id = 2; method = 'tools/call'
        params = @{ name = $Tool; arguments = $arguments }
    }
} else {
    $init
}
