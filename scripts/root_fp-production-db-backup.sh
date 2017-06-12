#!/usr/bin/env bash

# example
# /opt/admin/posm-admin/scripts/root_fp-production-db-backup.sh /opt/data/backups/fieldpapers

set -eo pipefail

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

timestamp=$(date +%Y%m%d%H%M%S)
backup_path=/opt/data/backups

echo "==> $0"

backup_path=$1

echo '=> Backing up osm api database to: ' $backup_path/$timestamp
# create timestamp directory
mkdir $backup_path/$timestamp

echo '=> Dumping database...'
#dump mysql db - date format: YYYYMMDD-HH-MM/SS
mysqldump -uroot -pposm fieldpapers_production | gzip > $backup_path/$timestamp/fp_prod_db.sql.gz

echo '=> Copying field paper atlases & snapshots ...'
# copy fp data into $backup_path/fieldpapers/
cp -alf /opt/fp/data/ $backup_path/$timestamp

echo "==> $0: END"
echo
