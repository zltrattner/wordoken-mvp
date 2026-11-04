$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$assetMap = Get-Content -LiteralPath (Join-Path $project 'design-reference/assets.json') -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path (Join-Path $project 'public/assets'),(Join-Path $project 'public/fonts'),(Join-Path $project 'public/icons') | Out-Null
foreach ($property in $assetMap.PSObject.Properties) {
  $asset = $property.Value
  $destination = Join-Path $project ('public/' + $asset.path)
  if (-not (Test-Path -LiteralPath $destination)) {
    & curl.exe -L --fail --silent --show-error --retry 2 $asset.url -o $destination
    if ($LASTEXITCODE -ne 0) { throw ('Asset download failed: ' + $property.Name) }
  }
  if ((Get-Item -LiteralPath $destination).Length -eq 0) { throw ('Empty asset: ' + $property.Name) }
}
$fontSource = 'C:/Users/zach/Documents/Projects/Wordoken/WORDOKEN - App Design_Folder/WORDOKEN - App Design_Folder/Fonts'
foreach ($weight in @('Black','SemiBold','Medium','Regular')) {
  Copy-Item -LiteralPath (Join-Path $fontSource ('Fixture-Expanded-' + $weight + '.otf')) -Destination (Join-Path $project 'public/fonts')
}
Write-Output ('Downloaded and verified ' + $assetMap.PSObject.Properties.Count + ' assets and copied supplied Fixture fonts.')
