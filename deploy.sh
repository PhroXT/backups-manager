#!/bin/bash

set -e

if [ ! -f .env ]; then
    echo "ERROR: .env file not found."
    exit 1
fi

set -a
source .env
set +a

if [ -z "$BACKUP_UID" ] || [ -z "$BACKUP_GID" ]; then
    echo "ERROR: BACKUP_UID or BACKUP_GID is not configured."
    exit 1
fi

echo "Preparing storage directory..."

mkdir -p storage

sudo chown -R "${BACKUP_UID}:${BACKUP_GID}" storage

echo "Storage:"
ls -ld storage

echo "Starting application..."

docker compose up -d --build

echo "Deployment completed successfully."