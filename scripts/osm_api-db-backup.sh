#!/usr/bin/env bash

# example
# sudo -u postgres /opt/admin/posm-admin/scripts/osm_api-db-backup.sh /opt/data/backups/osm

set -eo pipefail

echo '==> osm_api-db-backup.sh'

backup_path=$1

echo '=> Backing up osm api database to: ' $backup_path
echo '=> Dumping database...'
output="apidb-$(date +%Y%m%d%H%M%S).sql.gz"
pg_dump osm | gzip > "${backup_path}/${output}"

# link PBF dumps
cp -al /opt/data/api-db-dumps/ $backup_path

echo "==> osm_api-db-backup.sh END"
