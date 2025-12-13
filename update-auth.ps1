# PowerShell script to add auth buttons to all HTML files in NullSector
# This script replaces search containers with auth buttons across all pages

$files = Get-ChildItem -Path . -Filter *.html -Recurse | Where-Object { $_.Name -notlike "test-*" }

$authButtonHTML = @'
                <button id="authButton" class="nav-link" style="background: var(--accent-gradient); border: none; padding: 0.5rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; color: var(--bg-dark); display: none;">Login</button>
                <div id="userProfile" style="display: none; align-items: center; gap: 0.5rem;">
                    <img id="userAvatar" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--primary-color); cursor: pointer;" title="" />
                    <button id="logoutButton" class="nav-link" style="background: rgba(255, 95, 87, 0.1); border: 1px solid #ff5f57; padding: 0.4rem 1rem; border-radius: 6px; font-weight: 500; cursor: pointer; color: #ff5f57;">Logout</button>
                </div>
'@

$authScripts = @'
    
    <!-- Supabase Client & Auth -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="auth.js"></script>
'@

$searchContainerPattern = @'
            <div class="search-container">
                <input type="text" class="search-input" placeholder="Search...">
                <span class="search-shortcut">CTRL K</span>
            </div>
'@

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip files that already have auth
    if ($content -match 'id="authButton"') {
        Write-Host "Skipping $($file.Name) - already has auth" -ForegroundColor Yellow
        continue
    }
    
    # Replace search container with auth buttons
    if ($content -match [regex]::Escape($searchContainerPattern)) {
        $content = $content -replace [regex]::Escape($searchContainerPattern), $authButtonHTML
        Write-Host "Updated nav in $($file.Name)" -ForegroundColor Green
    } else {
        # Try alternative search pattern (single line)
        $altPattern = '<div class="search-container">.*?</div>'
        if ($content -match $altPattern) {
            $content = $content -replace $altPattern, $authButtonHTML
            Write-Host "Updated nav (alt) in $($file.Name)" -ForegroundColor Green
        }
    }
    
    # Add auth scripts before </body> if not present
    if ($content -match '</body>' -and $content -notmatch 'auth\.js') {
        $content = $content -replace '</body>', ($authScripts + "`n</body>")
        Write-Host "Added auth scripts to $($file.Name)" -ForegroundColor Cyan
    }
    
    # Write back
    $content | Set-Content $file.FullName -NoNewline
}

Write-Host "`nDone! Updated navigation and auth for all HTML files." -ForegroundColor Green
