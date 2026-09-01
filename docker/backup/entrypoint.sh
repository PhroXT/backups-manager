#!/bin/sh

set -e

if [ -z "$BACKUP_UID" ] || [ -z "$BACKUP_GID" ]; then
    echo "ERROR: BACKUP_UID and BACKUP_GID must be configured."
    exit 1
fi

chown "${BACKUP_UID}:${BACKUP_GID}" /backup

exec su-exec "${BACKUP_UID}:${BACKUP_GID}" "$@"