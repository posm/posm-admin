#!/bin/bash

# example
# sudo -u postgres /opt/admin/posm-admin/scripts/osm_api-db-backup.sh /opt/data/api-db-dumps/

echo '==> postgres_api-db-backup.sh'

backup_path=$1

echo '=> Backing up osm api database to: ' $backup_path
echo '=> Dumping database...'
#dump db - date format: YYYYMMDD-HH-MM/SS
pg_dump osm | gzip > $backup_path/osm`date +%Y%m%d-%H%M:%S`.sql.gz

echo "==> postgres_api-db-backup.sh END"
