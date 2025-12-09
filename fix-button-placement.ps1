# Fix script placement - Move fix-buttons-global.js AFTER Firebase SDK loading
# This ensures Firebase SDK loads first, then the button fix, then firebase-config.js

$pages = Get-ChildItem -Path . -Include *.html -Recurse -File | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\archived_docs\*" -and
    $_.FullName -notlike "*\tests\*"
}

$fixedCount = 0
$errorCount = 0

foreach ($page in $pages) {
    $relativePath = $page.FullName.Replace($PSScriptRoot + "\", "")
    $content = Get-Content $page.FullName -Raw -ErrorAction SilentlyContinue
    
    if (!$content) {
        Write-Host "Could not read: $relativePath" -ForegroundColor Red
        $errorCount++
        continue
    }
    
    # Check if page has firebase-config.js (meaning it needs Firebase)
    if ($content -notmatch 'firebase-config\.js') {
        continue
    }
    
    # Check if fix-buttons-global is already in correct position (after Firebase SDK)
    if ($content -match 'firebase-app-compat\.js.*fix-buttons-global\.js.*firebase-config\.js') {
        Write-Host "Already correct: $relativePath" -ForegroundColor Green
        continue
    }
    
    # Determine the correct path to fix-buttons-global.js
    $depth = ($relativePath.Split('\').Length - 1)
    $fixPath = if ($depth -eq 0) {
        "assets/js/fix-buttons-global.js"
    } elseif ($depth -eq 1) {
        "../assets/js/fix-buttons-global.js"
    } else {
        "../../assets/js/fix-buttons-global.js"
    }
    
    # Remove any existing fix-buttons-global.js references
    $content = $content -replace '  <!-- CRITICAL FIX: Load button fix FIRST -->[\r\n]+  <script src="[^"]*fix-buttons-global\.js"></script>[\r\n]+  ', ''
    $content = $content -replace '  <!-- CRITICAL FIX: Load button fix AFTER Firebase SDK but BEFORE firebase-config -->[\r\n]+  <script src="[^"]*fix-buttons-global\.js"></script>[\r\n]+  ', ''
    $content = $content -replace '<script src="[^"]*fix-buttons-global\.js"></script>[\r\n]*', ''
    
    # Now add it in the correct position - right after Firebase SDK, before firebase-config.js
    if ($content -match 'firebase-database-compat\.js">') {
        # Add after firebase-database-compat.js and before firebase-config.js
        $fixBlock = "`r`n  `r`n  <!-- CRITICAL FIX: Load button fix AFTER Firebase SDK but BEFORE firebase-config -->`r`n  <script src=`"$fixPath`"></script>`r`n  "
        $content = $content -replace '(firebase-database-compat\.js"></script>)([\r\n\s]*<script src="[^"]*firebase-config\.js)', "`$1$fixBlock`$2"
        
        Set-Content -Path $page.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "Fixed: $relativePath" -ForegroundColor Cyan
        $fixedCount++
    } else {
        Write-Host "No Firebase SDK found in: $relativePath" -ForegroundColor Yellow
        $errorCount++
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor White
Write-Host "SUMMARY:" -ForegroundColor White
Write-Host "  Fixed: $fixedCount pages" -ForegroundColor Cyan
Write-Host "  Errors: $errorCount pages" -ForegroundColor Red
Write-Host "================================" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: The fix is now loaded AFTER Firebase SDK but BEFORE firebase-config.js" -ForegroundColor Green
Write-Host "This ensures Firebase loads correctly while still fixing buttons early." -ForegroundColor Green
