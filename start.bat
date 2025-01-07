@echo off
setlocal enabledelayedexpansion

:: Détecter l'adresse IP locale
echo [Startup] Détection de l'adresse IP locale...

for /f "tokens=3" %%a in ('route print ^| findstr "0.0.0.0"') do (
    set SERVER_IP=%%a
    goto :found
)

:found
if not defined SERVER_IP (
    echo [Error] Impossible de détecter l'adresse IP locale. Utilisation de 'localhost' par défaut.
    set SERVER_IP=localhost
) else (
    echo [Startup] Adresse IP détectée : %SERVER_IP%
)

:: Lancer Docker Compose avec l'adresse IP comme variable d'environnement
echo [Startup] Lancement de Docker Compose avec SERVER_URL=http://%SERVER_IP%:3001
set SERVER_URL=http://%SERVER_IP%:3001
docker-compose up --build

endlocal
pause
