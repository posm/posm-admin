#!/usr/bin/env bash

scripts_dir=/opt/admin/posm-admin/scripts
backups_dir=/opt/data/backups
timestamp=`date +%Y%m%d-%H%M:%S`

# back up osm api database
sudo -u postgres $scripts_dir/postgres_api-db-backup.sh $backups_dir/osm

# back up field papers production database, atlas & snapshots
$scripts_dir/root_fp-production-db-backup.sh $backups_dir/fieldpapers

# back up omk forms and submissions
# mkdir /opt/data/omk/$timestamp

# zip up omk data & save to backup directory
tar -zcvf $backups_dir/omk/$timestamp.tar.gz /opt/omk/OpenMapKitServer/data/