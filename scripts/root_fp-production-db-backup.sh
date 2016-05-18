#!/usr/bin/env bash

# example
# mysqldump -uroot -pposm fieldpapers_production | gzip > /opt/data/api-db-dumps/fieldpapers_production.sql.gz

timestamp=`date +%Y%m%d-%H%M:%S`

echo '=> root_fp-production-db-backup.sh'

backup_path=$1

echo '=> Backing up osm api database to: ' $backup_path/$timestamp
# create timestamp directory
mkdir /opt/data/fieldpapers/$timestamp

echo '=> Dumping database...'
#dump mysql db - date format: YYYYMMDD-HH-MM/SS
mysqldump -uroot -pposm fieldpapers_production | gzip > $backup_path/$timestamp/fp_prod_db.sql.gz

echo '=> Copying field paper atlases & snapshots ...'
# copy fp data into /opt/data/fieldpapers/
cp -a /opt/fp/data/. /opt/data/fieldpapers/$timestamp/

echo '=> Complete...'