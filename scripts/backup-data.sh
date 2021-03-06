#!/usr/bin/env bash

set -eo pipefail

scripts_dir=/opt/admin/posm-admin/scripts
backups_dir=/opt/data/backups

if [ $(whoami) != "posm-admin" ]; then
  >&2 echo $0 is intended to run as posm-admin
  exit 1
fi

# create backup dirs if necessary
sudo $scripts_dir/root_initialize-backups.sh

# back up osm api database
sudo -u osm $scripts_dir/osm_api-db-backup.sh $backups_dir/osm

# back up field papers production database, atlas & snapshots
echo "==> Backing up field papers production data, atlas & snapshots to $backups_dir/fieldpapers"
sudo $scripts_dir/root_fp-production-db-backup.sh $backups_dir/fieldpapers

# zip up omk data & save to backup directory
echo "==> Compressing omk data and backing up to $backups_dir/omk"
sudo -u omk $scripts_dir/omk_backup.sh

if [ -d "/opt/data/imagery" ]; then
  echo "==> Backing up imagery $backups_dir/imagery"
  cp -alf /opt/data/imagery/. ${backups_dir}/imagery
fi

if [ -d "/opt/data/opendronemap" ]; then
  echo "==> Backing up OpenDroneMap data to $backups_dir/opendronemap"
  cp -alf /opt/data/opendronemap/. ${backups_dir}/opendronemap
fi

if [ -d "/opt/data/webodm" ]; then
  echo "==> Backing up WebODM"
  sudo -u webodm $scripts_dir/webodm_backup.sh $backups_dir/webodm
fi

echo "==> Backing up AOIs to $backups_dir/aoi"
cp -alf /opt/data/aoi/. ${backups_dir}/aoi
