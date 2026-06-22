param(
	[Parameter(Mandatory = $true)]
	[ValidateSet('toolkits', 'button-defense2d')]
	[string]$SiteName
)

$ErrorActionPreference = 'Stop'

$siteRoot = Split-Path -Parent $PSScriptRoot
$docfxRoot = Join-Path $siteRoot 'docfx'
$docfxSiteRoot = Join-Path $docfxRoot "sites\$SiteName"
$docfxConfig = Join-Path $docfxSiteRoot 'docfx.json'
$docfxCommand = Join-Path $siteRoot 'tools\docfx-win-x64-v2.78.5\docfx.exe'
$localSourceDocs = Join-Path $docfxSiteRoot 'manual-source'
$projectSourceDocs = "F:\Projects\ButtonDefense2D\docs\$SiteName"
$localDocs = Join-Path $docfxSiteRoot 'manual'
$sharedToc = Join-Path $docfxRoot 'shared\site-toc.yml'
$localToc = Join-Path $docfxSiteRoot 'toc.yml'
$outputDirectory = Join-Path $siteRoot "public\api-docs\$SiteName"

if (-not (Test-Path -LiteralPath $docfxCommand -PathType Leaf)) {
	throw "Local DocFX was not found at $docfxCommand."
}

if (Test-Path -LiteralPath $localSourceDocs -PathType Container) {
	$sourceDocs = $localSourceDocs
}
elseif (Test-Path -LiteralPath $projectSourceDocs -PathType Container) {
	$sourceDocs = $projectSourceDocs
}
else {
	throw "Documentation source was not found at $localSourceDocs or $projectSourceDocs."
}

if (-not (Test-Path -LiteralPath $sharedToc -PathType Leaf)) {
	throw "Shared documentation navigation was not found at $sharedToc."
}

if (Test-Path -LiteralPath $localDocs) {
	Remove-Item -LiteralPath $localDocs -Recurse -Force
}

New-Item -ItemType Directory -Path $localDocs -Force | Out-Null
Copy-Item -Path (Join-Path $sourceDocs '*') -Destination $localDocs -Recurse -Force
Copy-Item -LiteralPath $sharedToc -Destination $localToc -Force

& $docfxCommand metadata $docfxConfig
if ($LASTEXITCODE -ne 0) {
	throw "DocFX metadata generation failed. Exit code: $LASTEXITCODE"
}

& $docfxCommand build $docfxConfig
if ($LASTEXITCODE -ne 0) {
	throw "DocFX site build failed. Exit code: $LASTEXITCODE"
}

Write-Host "The $SiteName DocFX site was generated in $outputDirectory."
