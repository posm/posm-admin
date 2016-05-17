#!/usr/bin/env bash

# example
# mysqldump -uroot -pposm fieldpapers_production | gzip > /opt/data/api-db-dumps/fieldpapers_production.sql.gz

echo '=> root_fp-production-db-backup.sh'

backup_path=$1

echo '=> Backing up osm api database to: ' $backup_path
echo '=> Dumping database...'

#dump mysql db - date format: YYYYMMDD-HH-MM/SS
mysqldump -uroot -pposm fieldpapers_production | gzip > $backup_path/fp_production`date +%Y%m%d-%H%M:%S`

echo '=> Complete...'