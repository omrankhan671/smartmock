# Add global button fix to all HTML pages
$pages = @(
    "about.html",
    "analytics.html",
    "career-services.html", 
    "certificate.html",
    "community.html",
    "contact.html",
    "home.html",
    "home-champion.html",
    "index.html",
    "interview.html",
    "leaderboard-demo.html",
    "loading.html",
    "peer-review.html",
    "portfolio.html",
    "profile.html",
    "report.html",
    "resume-builder.html",
    "study-groups.html",
    "test_navigation.html",
    "verify-certificate.html",
    "interview\ce\ai-interview.html",
    "interview\ce\ai-report.html",
    "interview\ce\courses.html",
    "interview\ce\interview.html",
    "interview\ce\preparation.html",
    "interview\ce\report.html",
    "interview\cs\ai-interview.html",
    "interview\cs\ai-interview-working.html",
    "interview\cs\ai-report.html",
    "interview\cs\courses.html",
    "interview\cs\interview.html",
    "interview\cs\preparation.html",
    "interview\cs\report.html",
    "interview\ec\ai-interview.html",
    "interview\ec\ai-report.html",
    "interview\ec\courses.html",
    "interview\ec\interview.html",
    "interview\ec\preparation.html",
    "interview\ec\report.html",
    "interview\ee\ai-interview.html",
    "interview\ee\ai-interview-backup.html",
    "interview\ee\ai-report.html",
    "interview\ee\courses.html",
    "interview\ee\interview.html",
    "interview\ee\preparation.html",
    "interview\ee\report.html",
    "interview\me\ai-interview.html",
    "interview\me\ai-report.html",
    "interview\me\courses.html",
    "interview\me\interview.html",
    "interview\me\preparation.html",
    "interview\me\report.html",
    "recruiter\candidates.html",
    "recruiter\dashboard.html",
    "recruiter\interview-room.html",
    "recruiter\leaderboard.html",
    "recruiter\login.html",
    "recruiter\register.html",
    "recruiter\reports.html",
    "recruiter\schedule.html",
    "recruiter\settings.html"
)

$fixedCount = 0
$alreadyFixed = 0
$errorCount = 0

foreach ($page in $pages) {
    $fullPath = Join-Path $PSScriptRoot $page
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "⚠️ File not found: $page" -ForegroundColor Yellow
        $errorCount++
        continue
    }
    
    $content = Get-Content $fullPath -Raw
    
    # Check if fix already added
    if ($content -match "fix-buttons-global\.js") {
        Write-Host "✅ Already fixed: $page" -ForegroundColor Green
        $alreadyFixed++
        continue
    }
    
    # Find the firebase-config.js line and add our fix before it
    if ($content -match 'firebase-config\.js') {
        # Determine the correct path based on folder depth
        $fixScriptPath = "assets/js/fix-buttons-global.js"
        if ($page -match "interview\\") {
            $fixScriptPath = "../../assets/js/fix-buttons-global.js"
        } elseif ($page -match "recruiter\\") {
            $fixScriptPath = "../assets/js/fix-buttons-global.js"
        }
        
        $fixLine = "  <!-- CRITICAL FIX: Load button fix FIRST -->`r`n  <script src=`"$fixScriptPath`"></script>`r`n  "
        
        # Add before firebase-config.js
        $newContent = $content -replace '(  <script src="[^"]*firebase-config\.js)', "$fixLine`$1"
        
        Set-Content -Path $fullPath -Value $newContent -NoNewline -Encoding UTF8
        Write-Host "Fixed: $page" -ForegroundColor Cyan
        $fixedCount++
    } else {
        Write-Host "No firebase-config.js found in: $page" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor White
Write-Host "SUMMARY:" -ForegroundColor White
Write-Host "  Fixed: $fixedCount pages" -ForegroundColor Cyan
Write-Host "  Already fixed: $alreadyFixed pages" -ForegroundColor Green
Write-Host "  Errors: $errorCount pages" -ForegroundColor Red
Write-Host "================================" -ForegroundColor White
Write-Host ""
