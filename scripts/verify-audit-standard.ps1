param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $Root).Path
$configPath = Join-Path $resolvedRoot 'config\audit\audit-standard.json'
$standardPath = Join-Path $resolvedRoot 'docs\audit\UNIVERSAL_PROJECT_AUDIT_STANDARD.md'
$templatePath = Join-Path $resolvedRoot 'docs\audit\AUDIT_REPORT_TEMPLATE.md'

foreach ($path in @($configPath, $standardPath, $templatePath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Required audit-standard asset is missing: $path"
    }
}

$config = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($config.standardId -ne 'UPARS' -or $config.version -notmatch '^\d+\.\d+\.\d+$') {
    throw 'Audit-standard identity or semantic version is invalid.'
}

$requiredDomains = @(
    'code_conventions',
    'correctness_reliability',
    'security_privacy',
    'data_storage',
    'ui_accessibility_i18n',
    'build_test_release'
)
$requiredFindingFields = @(
    'id',
    'status',
    'severity',
    'confidence',
    'scope',
    'evidence',
    'trigger',
    'impact',
    'releaseReachability',
    'remediation',
    'verification'
)

foreach ($domain in $requiredDomains) {
    if ($domain -notin $config.requiredDomains) {
        throw "Required audit domain is missing: $domain"
    }
}
foreach ($field in $requiredFindingFields) {
    if ($field -notin $config.finding.requiredFields) {
        throw "Required finding field is missing: $field"
    }
}
foreach ($severity in @('P0', 'P1', 'P2', 'P3')) {
    if (-not $config.finding.severities.$severity) {
        throw "Required severity is missing: $severity"
    }
}
if ($config.releaseGate.maximumOpen.P0 -ne 0 -or
        $config.releaseGate.maximumOpen.P1 -ne 0) {
    throw 'P0 and P1 release gates must remain zero.'
}
if (-not $config.releaseGate.codeAuditPassDoesNotImplyProductionRelease) {
    throw 'The code-audit and production-release verdicts must remain separate.'
}

$standard = Get-Content -LiteralPath $standardPath -Raw -Encoding UTF8
$template = Get-Content -LiteralPath $templatePath -Raw -Encoding UTF8
if ($standard -notmatch ("(?m)^- [^\r\n]+\uFF1A{0}\r?$" -f [regex]::Escape($config.version))) {
    throw 'The human-readable standard version does not match the machine-readable version.'
}
if ($template -notmatch ("(?m)^- [^\r\n]+\uFF1AUPARS {0}\r?$" -f [regex]::Escape($config.version))) {
    throw 'The report-template version does not match the machine-readable version.'
}

$requiredTemplateSections = @(
    '## 1. ',
    '## 2. ',
    '## 3. ',
    '## 4. ',
    '## 5. ',
    '## 7. ',
    '## 8. ',
    '## 9. '
)
foreach ($heading in $requiredTemplateSections) {
    if (-not $template.Contains($heading)) {
        throw "Required report section is missing: $heading"
    }
}

Write-Host (
    "AUDIT_STANDARD_OK id={0} version={1} domains={2} findingFields={3}" -f
    $config.standardId,
    $config.version,
    $config.requiredDomains.Count,
    $config.finding.requiredFields.Count)
