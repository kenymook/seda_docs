param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

$rootPath = Resolve-Path -LiteralPath $Root
$tokensPath = Join-Path $rootPath "tokens.json"
$specRoot = Join-Path $rootPath "specs"

if (-not (Test-Path -LiteralPath $tokensPath)) {
  Write-Error "Missing tokens.json"
}

if (-not (Test-Path -LiteralPath $specRoot)) {
  Write-Error "Missing specs directory"
}

$tokenJson = Get-Content -LiteralPath $tokensPath -Raw -Encoding UTF8 | ConvertFrom-Json
$knownTokens = New-Object System.Collections.Generic.HashSet[string]

function Add-TokenPaths {
  param(
    [object]$Node,
    [string[]]$Path
  )

  if ($null -eq $Node) {
    return
  }

  $properties = $Node.PSObject.Properties
  $typeProp = $properties | Where-Object { $_.Name -eq '$type' } | Select-Object -First 1
  $valueProp = $properties | Where-Object { $_.Name -eq '$value' } | Select-Object -First 1

  if ($typeProp -and $valueProp -and $Path.Count -gt 0) {
    $knownTokens.Add(($Path -join '/')) | Out-Null
    return
  }

  foreach ($property in $properties) {
    if ($property.Name.StartsWith('$')) {
      continue
    }

    Add-TokenPaths -Node $property.Value -Path ($Path + $property.Name)
  }
}

foreach ($collection in $tokenJson.'$collections'.PSObject.Properties) {
  $modes = $collection.Value.'$modes'
  if ($null -eq $modes) {
    continue
  }

  foreach ($mode in $modes.PSObject.Properties) {
    Add-TokenPaths -Node $mode.Value -Path @()
  }
}

$tokenPrefixes = @(
  "surface",
  "container",
  "border",
  "text",
  "link",
  "status",
  "shadow",
  "focus",
  "tag",
  "button",
  "icon-button",
  "field",
  "input",
  "modal",
  "drawer",
  "toast",
  "alert",
  "skeleton",
  "spinner",
  "colorpicker",
  "space",
  "radius",
  "elevation",
  "duration",
  "easing",
  "motion"
)

$refs = New-Object System.Collections.Generic.List[object]
$specFiles = Get-ChildItem -LiteralPath $specRoot -Recurse -Filter "*.md" |
  Where-Object { $_.Name -ne "component-spec-template.md" }

foreach ($file in $specFiles) {
  $lines = Get-Content -LiteralPath $file.FullName -Encoding UTF8
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]

    foreach ($match in [regex]::Matches($line, '`([^`]+)`')) {
      $value = $match.Groups[1].Value.Trim()

      if ($value.StartsWith("--")) {
        $refs.Add([pscustomobject]@{
          Ref = $value
          Kind = "css-custom-property"
          Status = "component-specific"
          File = (Resolve-Path -LiteralPath $file.FullName -Relative)
          Line = $i + 1
        }) | Out-Null
        continue
      }

      if ($value -notmatch '/') {
        continue
      }

      $prefix = ($value -split '/')[0]
      if ($tokenPrefixes -notcontains $prefix) {
        continue
      }

      $status = "unknown"
      if ($knownTokens.Contains($value)) {
        $status = "known"
      }
      elseif ($prefix -in @("button", "icon-button", "field", "input", "modal", "drawer", "toast", "alert", "skeleton", "spinner", "colorpicker")) {
        $status = "component-specific"
      }

      $refs.Add([pscustomobject]@{
        Ref = $value
        Kind = "token-reference"
        Status = $status
        File = (Resolve-Path -LiteralPath $file.FullName -Relative)
        Line = $i + 1
      }) | Out-Null
    }
  }
}

$knownCount = ($refs | Where-Object { $_.Status -eq "known" }).Count
$componentSpecificCount = ($refs | Where-Object { $_.Status -eq "component-specific" }).Count
$unknownCount = ($refs | Where-Object { $_.Status -eq "unknown" }).Count

Write-Host "Token reference audit"
Write-Host "Known tokens: $knownCount"
Write-Host "Component-specific refs: $componentSpecificCount"
Write-Host "Unknown refs: $unknownCount"

if ($unknownCount -gt 0) {
  Write-Host ""
  Write-Host "Unknown token references:"
  $refs |
    Where-Object { $_.Status -eq "unknown" } |
    Sort-Object Ref, File, Line |
    ForEach-Object {
      Write-Host "- $($_.Ref) @ $($_.File):$($_.Line)"
    }
}

exit 0
