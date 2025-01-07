#!/bin/bash

# Récupérer l'IP du réseau Wi-Fi (ou adapter selon votre configuration)
echo "[Startup] Détection de l'adresse IP locale..."

SERVER_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}')

if [ -z "$SERVER_IP" ]; then
  echo "[Error] Impossible de détecter l'adresse IP locale. Utilisation de 'localhost' par défaut."
  SERVER_IP="localhost"
else
  echo "[Startup] Adresse IP détectée : $SERVER_IP"
fi

# Lancer Docker Compose avec l'adresse IP comme variable d'environnement
echo "[Startup] Lancement de Docker Compose avec SERVER_URL=http://$SERVER_IP:3001"
SERVER_URL="http://$SERVER_IP:3001" docker-compose up --build
