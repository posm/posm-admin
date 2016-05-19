#!/bin/bash

# example
# sudo -u postgres /opt/admin/posm-admin/scripts/postgres_api-db-backup.sh /opt/data/backups/osm

echo '==> postgres_api-db-backup.sh'

backup_path=$1

echo '=> Backing up osm api database to: ' $backup_path
echo '=> Dumping database...'
#dump db - date format: YYYYMMDD-HH-MM/SS
pg_dump osm | gzip > $backup_path/api-db`date +%Y%m%d-%H%M:%S`.sql.gz

# move pbf dump to /backups
cp -f /opt/data/api-db-dumps/. $backup_path

echo "==> postgres_api-db-backup.sh END"