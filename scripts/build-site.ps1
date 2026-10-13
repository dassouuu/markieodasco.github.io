# Windows 10/11 updater. Requires only the built-in Windows PowerShell.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$utf8 = [System.Text.UTF8Encoding]::new($false)
function Read-Text([string]$name) {
    return [System.IO.File]::ReadAllText((Join-Path $root $name), [System.Text.Encoding]::UTF8)
}
function Script-Json($value) {
    $json = ConvertTo-Json -InputObject $value -Depth 8 -Compress
    return $json.Replace('<', '\u003c').Replace('>', '\u003e').Replace('&', '\u0026')
}
try {
    $text = Read-Text 'portfolio.ini'
    # Collect file references and catch missing files before replacing the preview.
    $projects = @()
    $current = $null
    foreach ($raw in ($text -split "`r?`n")) {
        $line = $raw.Trim().TrimStart([char]0xFEFF)
        if ($line -match '^\[project:([a-z0-9]+(?:-[a-z0-9]+)*)\]$') {
            $current = @{ id=$Matches[1] }
            $projects += $current
        } elseif ($line.StartsWith('[')) {
            $current = $null
        } elseif ($null -ne $current -and $line -match '^([a-z-]+)\s*=(.*)$') {
            $current[$Matches[1]] = $Matches[2].Trim()
        }
    }
    foreach ($project in $projects) {
        if ($project['enabled'] -eq 'no') { continue }
        $thumbnail = $project['thumbnail']
        if (-not $thumbnail) { $thumbnail = $project.id + '.jpg' }
        $video = $project['video']
        if (-not $video -and $project['placeholder'] -ne 'yes') { $video = $project.id + '.mp4' }
        foreach ($item in @(@{folder='thumbnails';file=$thumbnail}, @{folder='videos';file=$video})) {
            if (-not $item.file) { continue }
            if ($item.file -notmatch '^[a-zA-Z0-9][a-zA-Z0-9._-]*$' -or $item.file.Contains('..')) {
                throw "Use only a filename without spaces or folders for project '$($project.id)'."
            }
            $relative = 'assets/' + $item.folder + '/' + $item.file
            if (-not [System.IO.File]::Exists((Join-Path $root $relative))) {
                throw "Missing file: $relative . Copy your file there, or fix its filename in portfolio.ini."
            }
        }
    }
    $data = "// Generated from portfolio.ini. Do not edit.`nwindow.PORTFOLIO_TEXT = " + (Script-Json $text) + ";`n"
    $assets = @{}
    $mime = @{'.svg'='image/svg+xml';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.png'='image/png';'.webp'='image/webp';'.gif'='image/gif'}
    foreach ($file in (Get-ChildItem -LiteralPath (Join-Path $root 'assets') -File -Recurse)) {
        $extension = $file.Extension.ToLowerInvariant()
        if (-not $mime.ContainsKey($extension)) { continue }
        $relative = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
        $assets[$relative] = 'data:' + $mime[$extension] + ';base64,' + [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($file.FullName))
    }
    $html = Read-Text 'index.html'
    $css = Read-Text 'styles.css'
    $html = $html.Replace('<link rel="stylesheet" href="styles.css">', "<style>`n" + $css + "`n</style>")
    $html = [regex]::Replace($html, '\s*<script defer src="(?:config-data|portfolio-config|app)\.js"></script>', '')
    $html = [regex]::Replace($html, '\s*<!-- PREVIEW DIAGNOSTIC START -->[\s\S]*?<!-- PREVIEW DIAGNOSTIC END -->', '')
    foreach ($key in $assets.Keys) { $html = $html.Replace('"' + $key + '"', '"' + $assets[$key] + '"') }
    $scripts = @()
    $scripts += ($data + "window.PORTFOLIO_EMBEDDED = true;`nwindow.PORTFOLIO_ASSETS = " + (Script-Json $assets) + ';')
    $scripts += (Read-Text 'portfolio-config.js')
    $scripts += (Read-Text 'app.js')
    $inline = ''
    foreach ($script in $scripts) { $inline += "<script>`n" + $script.Replace('</script', '<\/script') + "`n</script>`n" }
    $html = $html.Replace('</body>', $inline + '</body>')
    [System.IO.File]::WriteAllText((Join-Path $root 'config-data.js'), $data, $utf8)
    [System.IO.File]::WriteAllText((Join-Path $root 'START-HERE.html'), $html, $utf8)
    Write-Host 'Updated! Open START-HERE.html in Edge or Chrome.' -ForegroundColor Green
    Write-Host 'After uploading the updated files, index.html is your GitHub Pages homepage.'
    exit 0
} catch {
    Write-Host ('Update failed: ' + $_.Exception.Message) -ForegroundColor Red
    Write-Host 'Fix portfolio.ini or the missing files, then double-click UPDATE-PORTFOLIO.cmd again.'
    exit 1
}
