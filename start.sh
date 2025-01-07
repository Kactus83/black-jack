#!/bin/bash

echo "[Startup] Detecting all local IPv4 addresses..."

# Retrieve all IPv4 addresses that match 192. or 10. or 172.1
SERVER_URL_LIST=""

# `hostname -I` returns all IPs, space-separated. We'll parse them.
for ip in $(hostname -I); do
  # Check if IP starts with 192., 10. or 172.1
  if [[ "$ip" == 192.* || "$ip" == 10.* || "$ip" == 172.1* ]]; then
    if [ -z "$SERVER_URL_LIST" ]; then
      SERVER_URL_LIST="http://$ip:3001"
    else
      SERVER_URL_LIST="$SERVER_URL_LIST,http://$ip:3001"
    fi
  fi
done

if [ -z "$SERVER_URL_LIST" ]; then
  echo "[Error] No valid LAN IP found (192.x, 10.x, 172.1). Cannot continue."
  echo "[Error] Check Wi-Fi or Ethernet."
  exit 1
else
  echo "[Startup] LAN IP addresses detected: $SERVER_URL_LIST"
fi

echo "[Startup] Starting Docker Compose with SERVER_URL_LIST=$SERVER_URL_LIST"
SERVER_URL_LIST="$SERVER_URL_LIST" docker-compose up --build
