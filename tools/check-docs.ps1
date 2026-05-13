param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

$rootPath = Resolve-Path -LiteralPath $Root
$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-Error {
  param([string]$Message)
  $errors.Add($Message) | Out-Null
}

function Add-Warning {
  param([string]$Message)
  $warnings.Add($Message) | Out-Null
}

function ConvertTo-Slug {
  param([string]$Name)
  $value = $Name.ToLowerInvariant()
  $value = $value -replace '\s*/\s*.*$', ''
  $value = $value -replace '&', 'and'
  $value = $value -replace '[^a-z0-9]+', '-'
  $value = $value.Trim('-')
  return $value
}

$requiredFoundation = @(
  "accessibility.md",
  "typography.md",
  "tokens.md",
  "color.md",
  "spacing-sizing.md",
  "radius-border.md",
  "elevation.md",
  "motion.md",
  "content.md",
  "iconography.md",
  "governance.md",
  "token-pipeline.md"
)

foreach ($file in $requiredFoundation) {
  $path = Join-Path $rootPath "foundation\$file"
  if (-not (Test-Path -LiteralPath $path)) {
    Add-Error "Missing foundation file: foundation/$file"
  }
}

$specRoot = Join-Path $rootPath "specs"
if (Test-Path -LiteralPath $specRoot) {
  $specFiles = Get-ChildItem -LiteralPath $specRoot -Recurse -Filter "*.md" |
    Where-Object { $_.Name -ne "component-spec-template.md" }

  $componentOverviewPath = Join-Path $rootPath "foundation\components.md"
  if (Test-Path -LiteralPath $componentOverviewPath) {
    $overviewContent = Get-Content -LiteralPath $componentOverviewPath -Raw -Encoding UTF8
    $overviewNames = [regex]::Matches($overviewContent, '(?m)^###\s+(.+)$') |
      ForEach-Object { $_.Groups[1].Value.Trim() } |
      Where-Object { $_ -and $_ -match '^[A-Za-z]' }

    $overviewAliases = @{
      "Sidebar / Navigation Menu" = "sidebar"
      "Top Bar / Navbar" = "top-bar"
      "Toast / Snackbar" = "toast"
      "Modal / Dialog" = "modal"
      "Spinner / Loader" = "spinner"
      "Dropdown / Menu" = "dropdown-menu"
      "Stat / Metric" = "stat-metric"
    }

    $expectedSlugs = New-Object System.Collections.Generic.HashSet[string]
    foreach ($name in $overviewNames) {
      if ($overviewAliases.ContainsKey($name)) {
        $expectedSlugs.Add($overviewAliases[$name]) | Out-Null
      }
      else {
        $expectedSlugs.Add((ConvertTo-Slug $name)) | Out-Null
      }
    }

    $actualSlugs = New-Object System.Collections.Generic.HashSet[string]
    foreach ($file in $specFiles) {
      $actualSlugs.Add($file.BaseName) | Out-Null
    }

    foreach ($slug in $expectedSlugs) {
      if (-not $actualSlugs.Contains($slug)) {
        Add-Error "Component listed in overview but missing spec: $slug"
      }
    }

    foreach ($slug in $actualSlugs) {
      if (-not $expectedSlugs.Contains($slug)) {
        Add-Error "Spec exists but component missing in overview: $slug"
      }
    }
  }
  else {
    Add-Error "Missing component overview: foundation/components.md"
  }

  foreach ($file in $specFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    $relative = Resolve-Path -LiteralPath $file.FullName -Relative
    $statusLine = ([regex]::Match($content, '(?m)^> \*\*Status\*\*.*$')).Value
    $status = "unknown"
    if ($statusLine -match '(draft|needs-review|ready|deprecated)') {
      $status = $Matches[1]
    }

    $figmaLine = ([regex]::Match($content, '(?m)^> \*\*Figma\*\*.*$')).Value
    if ($figmaLine -and $figmaLine -notmatch 'https://www\.figma\.com/') {
      if ($status -eq "ready") {
        Add-Error "Missing real Figma URL on ready spec: $relative"
      }
      else {
        Add-Warning "Missing real Figma URL on $status spec: $relative"
      }
    }
    elseif ($content -match "TODO: node-id|placeholder") {
      Add-Warning "Placeholder reference: $relative"
    }

    foreach ($field in @("Status", "Owner", "Last reviewed", "Figma")) {
      if ($content -notmatch "\*\*$field\*\*") {
        Add-Error "Missing metadata '$field': $relative"
      }
    }

    foreach ($section in @("Anatomy", "States", "Accessibility", "Design Tokens")) {
      if ($content -notmatch "## .*?$section") {
        Add-Error "Missing section '$section': $relative"
      }
    }
  }
}
else {
  Add-Error "Missing specs directory"
}

$tokenAuditScript = Join-Path $rootPath "tools\check-token-refs.ps1"
if (Test-Path -LiteralPath $tokenAuditScript) {
  $tokenAuditOutput = & powershell -ExecutionPolicy Bypass -File $tokenAuditScript -Root $rootPath 2>&1
  $unknownLine = $tokenAuditOutput | Where-Object { $_ -match '^Unknown refs:' } | Select-Object -First 1
  if ($unknownLine -and $unknownLine -notmatch 'Unknown refs:\s+0$') {
    Add-Error "Unknown token references found. Run tools/check-token-refs.ps1 for details."
  }
}
else {
  Add-Error "Missing token reference checker: tools/check-token-refs.ps1"
}

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
  Write-Host "Docs check passed."
  exit 0
}

Write-Host "Docs check found $($errors.Count) error(s), $($warnings.Count) warning(s)."

if ($errors.Count -gt 0) {
  Write-Host ""
  Write-Host "Errors:"
  foreach ($errorItem in $errors) {
    Write-Host "- $errorItem"
  }
}

if ($warnings.Count -gt 0) {
  Write-Host ""
  Write-Host "Warnings:"
  foreach ($warningItem in $warnings) {
    Write-Host "- $warningItem"
  }
}

if ($errors.Count -gt 0) {
  exit 1
}

exit 0
