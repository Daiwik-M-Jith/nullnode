<#
.SYNOPSIS
A safe script to (force) push the current HEAD to remote branches 'main' and 'master'.

.DESCRIPTION
This script performs checks and then pushes the current HEAD to the repo specified (default origin repo for this project).
By default it uses `--force-with-lease` to avoid unexpectedly clobbering others' work. Use `-ForcePush` to use unconditional `--force`.

.NOTES
- Make sure you are running this from the project root where `.git` is available.
- This script does not change branch names. It pushes HEAD to remote branches `main` and `master`.
#>

param(
    [string]$RemoteUrl = 'https://github.com/Daiwik-M-Jith/nullnode.git',
    [switch]$AddRemoteIfMissing,
    [switch]$ForcePush,
    [switch]$DryRun
)

function Confirm-Action([string]$Message){
    $confirmation = Read-Host "$Message (y/N)"
    return $confirmation -match '^(y|Y)'
}

try {
    # Ensure we are in a git repo root
    if (-not (Test-Path -Path .git -PathType Container)) {
        Write-Host 'ERROR: This folder is not a git repository root (no .git folder found).' -ForegroundColor Red
        exit 1
    }

    $currentBranch = (git rev-parse --abbrev-ref HEAD) -replace '\s',''
    Write-Host "Current branch: $currentBranch"

    $remote = git remote | Select-Object -First 1
    if (-not $remote) {
        if ($AddRemoteIfMissing) {
            Write-Host "No remote found. Adding 'origin' pointing to $RemoteUrl"
            git remote add origin $RemoteUrl
            $remote = 'origin'
        } else {
            Write-Host "No remote configured. Use '-AddRemoteIfMissing' to add the default and retry." -ForegroundColor Yellow
            exit 1
        }
    } else {
        # Update remote url to match if user provided RemoteUrl
        $remoteUrl = git remote get-url $remote
        if ($RemoteUrl -and ($remoteUrl -ne $RemoteUrl)) {
            Write-Host "Remote '$remote' URL differs: $remoteUrl" -ForegroundColor Yellow
            if (Confirm-Action "Do you want to update remote '$remote' to '$RemoteUrl'?") {
                git remote set-url $remote $RemoteUrl
            }
        }
    }

    $remoteToUse = git remote | Select-Object -First 1
    Write-Host "Using remote: $remoteToUse" -ForegroundColor Cyan

    # Dry run option
    if ($DryRun) {
        Write-Host "DRY RUN: Commands that would run:" -ForegroundColor Yellow
        Write-Host "git fetch $remoteToUse --prune"
        Write-Host "git push $remoteToUse --force-with-lease HEAD:main"
        Write-Host "git push $remoteToUse --force-with-lease HEAD:master"
        exit 0
    }

    if (-not (Confirm-Action "This will overwrite remote branches. Are you sure you want to continue?")) {
        Write-Host 'Aborted by user.' -ForegroundColor Yellow
        exit 0
    }

    Write-Host 'Fetching remote refs...' -ForegroundColor Cyan
    git fetch $remoteToUse --prune

    $pushStrategy = if ($ForcePush) { '--force' } else { '--force-with-lease' }

    # Push to main
    Write-Host "Pushing HEAD to $remoteToUse/main using $pushStrategy..." -ForegroundColor Green
    git push $pushStrategy $remoteToUse HEAD:main
    $code = $LASTEXITCODE
    if ($code -ne 0) {
        Write-Host "Failed to push to main (exit $code)." -ForegroundColor Red
        if (-not $ForcePush -and Confirm-Action "Force-push using --force instead of --force-with-lease?") {
            Write-Host 'Using unconditional --force now (risky!)' -ForegroundColor Yellow
            git push --force $remoteToUse HEAD:main
        }
    }

    # Push to master
    Write-Host "Pushing HEAD to $remoteToUse/master using $pushStrategy..." -ForegroundColor Green
    git push $pushStrategy $remoteToUse HEAD:master
    $code = $LASTEXITCODE
    if ($code -ne 0) {
        Write-Host "Failed to push to master (exit $code)." -ForegroundColor Red
        if (-not $ForcePush -and Confirm-Action "Force-push using --force instead of --force-with-lease?") {
            Write-Host 'Using unconditional --force now (risky!)' -ForegroundColor Yellow
            git push --force $remoteToUse HEAD:master
        }
    }

    Write-Host 'Push completed. Double-check the GitHub repository to confirm.' -ForegroundColor Green
}
catch {
    Write-Host "Script failed: $_" -ForegroundColor Red
    exit 1
}