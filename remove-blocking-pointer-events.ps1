# Remove blocking pointer-events from project files
# Heuristic: remove 'pointer-events: none' except when used for known background elements

$root = Get-Location
$patternsToSkip = @("particles-container","bg-robot-container","body::before","canvas","particle","#bg-robot-container","particlesContainer","body::after")
$files = Get-ChildItem -Path $root -Include *.html,*.css -Recurse -File | Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\archived_docs\*" }

$modified = @()
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $lines = $content -split "\r?\n"
    $changed = $false
    $newLines = @()
    for ($i=0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        if ($line -match "pointer-events\s*:\s*none\s*;?") {
            $context = "";
            $start = [Math]::Max(0,$i-3)
            $end = [Math]::Min($lines.Length-1,$i+3)
            for ($j=$start; $j -le $end; $j++) { $context += $lines[$j] + " `n" }
            $skip = $false
            foreach ($p in $patternsToSkip) {
                if ($context.ToLower().Contains($p.ToLower())) { $skip = $true; break }
            }
            if ($skip) {
                $newLines += $line
            } else {
                # Remove the offending line (replace with comment for safety)
                $newLines += "/* REMOVED pointer-events:none to restore interactivity */"
                $changed = $true
                Write-Host "Removed blocking pointer-events in: $($file.FullName) (line $($i+1))" -ForegroundColor Yellow
            }
        } else {
            $newLines += $line
        }
    }
    if ($changed) {
        $newContent = $newLines -join "`r`n"
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        $modified += $file.FullName
    }
}

Write-Host "\nSUMMARY: Modified files count: $($modified.Count)" -ForegroundColor Cyan
$modified | ForEach-Object { Write-Host "  - $_" }

# End
