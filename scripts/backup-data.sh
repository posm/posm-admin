#!/usr/bin/env bash

set -eo pipefail

scripts_dir=/opt/admin/posm-admin/scripts
backups_dir=/opt/data/backups
timestamp=`date +%Y%m%d-%H%M:%S`

# back up osm api database
sudo -u osm $scripts_dir/osm_api-db-backup.sh $backups_dir/osm

# back up field papers production database, atlas & snapshots
echo "==> Backing up field papers production data, atlas & snapshots to $backups_dir/fieldpapers"
sudo $scripts_dir/root_fp-production-db-backup.sh $backups_dir/fieldpapers

# zip up omk data & save to backup directory
echo "==> Compressing omk data and backing up to $backups_dir/omk"
tar -zcf $backups_dir/omk/$timestamp.tar.gz /opt/omk/OpenMapKitServer/data/