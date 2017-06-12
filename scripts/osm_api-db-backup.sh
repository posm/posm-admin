#!/usr/bin/env bash

# example
# sudo -u postgres /opt/admin/posm-admin/scripts/osm_api-db-backup.sh /opt/data/backups/osm

set -eo pipefail

if [ $(whoami) != "osm" ]; then
  >&2 echo $0 is intended to run as osm
  exit 1
fi

echo "==> $0"

backup_path=$1

echo '=> Backing up osm api database to: ' $backup_path
echo '=> Dumping database...'
output="apidb-$(date +%Y%m%d%H%M%S).sql.gz"
pg_dump osm | gzip > "${backup_path}/${output}"

# link PBF dumps
cp -alf /opt/data/api-db-dumps/* $backup_path

echo "==> $0 END"
