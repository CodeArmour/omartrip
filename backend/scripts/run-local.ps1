$ErrorActionPreference = "Stop"

$backendDirectory = Split-Path -Parent $PSScriptRoot
$environmentFile = Join-Path $backendDirectory ".env"

if (-not (Test-Path -LiteralPath $environmentFile)) {
    throw "Missing backend/.env. Copy .env.example to .env and add your local credentials."
}

foreach ($line in Get-Content -LiteralPath $environmentFile) {
    $trimmed = $line.Trim()
    if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#")) {
        continue
    }
    $parts = $trimmed.Split("=", 2)
    if ($parts.Count -ne 2 -or [string]::IsNullOrWhiteSpace($parts[0])) {
        throw "Invalid entry in backend/.env. Expected KEY=VALUE."
    }
    [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
}

if ($env:SPRING_PROFILES_ACTIVE -like "*oauth-github*") {
    if ([string]::IsNullOrWhiteSpace($env:GITHUB_CLIENT_ID) -or
        [string]::IsNullOrWhiteSpace($env:GITHUB_CLIENT_SECRET) -or
        $env:GITHUB_CLIENT_ID.StartsWith("replace-with-") -or
        $env:GITHUB_CLIENT_SECRET.StartsWith("replace-with-")) {
        throw "GitHub OAuth is enabled, but real GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET values are missing."
    }
}

if ($env:SPRING_PROFILES_ACTIVE -like "*oauth-google*") {
    if ([string]::IsNullOrWhiteSpace($env:GOOGLE_CLIENT_ID) -or
        [string]::IsNullOrWhiteSpace($env:GOOGLE_CLIENT_SECRET) -or
        $env:GOOGLE_CLIENT_ID.StartsWith("replace-") -or
        $env:GOOGLE_CLIENT_SECRET.StartsWith("replace-")) {
        throw "Google OAuth is enabled, but real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET values are missing."
    }
}

if ($env:SPRING_PROFILES_ACTIVE -like "*oauth-workspace*") {
    if ([string]::IsNullOrWhiteSpace($env:GOOGLE_WORKSPACE_CLIENT_ID) -or
        [string]::IsNullOrWhiteSpace($env:GOOGLE_WORKSPACE_CLIENT_SECRET) -or
        [string]::IsNullOrWhiteSpace($env:GOOGLE_WORKSPACE_EMAIL) -or
        [string]::IsNullOrWhiteSpace($env:GOOGLE_WORKSPACE_ENCRYPTION_KEY) -or
        $env:GOOGLE_WORKSPACE_CLIENT_ID.StartsWith("replace-") -or
        $env:GOOGLE_WORKSPACE_CLIENT_SECRET.StartsWith("replace-") -or
        $env:GOOGLE_WORKSPACE_ENCRYPTION_KEY.StartsWith("base64-")) {
        throw "Google Workspace OAuth is enabled, but client credentials, mailbox, or a real base64 32-byte encryption key is missing."
    }
    try {
        $workspaceKeyBytes = [Convert]::FromBase64String($env:GOOGLE_WORKSPACE_ENCRYPTION_KEY)
        if ($workspaceKeyBytes.Length -ne 32) {
            throw "wrong length"
        }
    }
    catch {
        throw "GOOGLE_WORKSPACE_ENCRYPTION_KEY must be valid base64 encoding of exactly 32 bytes."
    }
}

Push-Location $backendDirectory
try {
    & mvn spring-boot:run
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
