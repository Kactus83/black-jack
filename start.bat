@echo off
setlocal enabledelayedexpansion

echo [Startup] Detecting active IPv4 addresses on LAN...

:: Variable to store the list of server URLs
set SERVER_URL_LIST=

:: Search for lines containing "IPv4 Address"
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /C:"Adresse IPv4"') do (
    set IP_TMP=%%A
    :: Remove extra spaces
    set IP_TMP=!IP_TMP: =!
    :: Check if it starts with 192., 10., or 172.1
    if "!IP_TMP:~0,4!"=="192." (
        if defined SERVER_URL_LIST (
            set SERVER_URL_LIST=!SERVER_URL_LIST!,http://!IP_TMP!:3001
        ) else (
            set SERVER_URL_LIST=http://!IP_TMP!:3001
        )
    ) else if "!IP_TMP:~0,3!"=="10." (
        if defined SERVER_URL_LIST (
            set SERVER_URL_LIST=!SERVER_URL_LIST!,http://!IP_TMP!:3001
        ) else (
            set SERVER_URL_LIST=http://!IP_TMP!:3001
        )
    ) else if "!IP_TMP:~0,5!"=="172.1" (
        if defined SERVER_URL_LIST (
            set SERVER_URL_LIST=!SERVER_URL_LIST!,http://!IP_TMP!:3001
        ) else (
            set SERVER_URL_LIST=http://!IP_TMP!:3001
        )
    )
)

if not defined SERVER_URL_LIST (
    echo [Error] No valid LAN IP address found. Cannot continue...
    echo [Error] Check your Wi-Fi or Ethernet is in 192.x, 10.x, or 172.16.x range.
    pause
    endlocal
    exit /b 1
) else (
    echo [Startup] LAN IP addresses detected: %SERVER_URL_LIST%
)

:: Launch Docker Compose with the list of addresses
echo [Startup] Starting Docker Compose with SERVER_URL_LIST=%SERVER_URL_LIST%
set SERVER_URL_LIST=%SERVER_URL_LIST%
docker-compose up --build

endlocal
pause
