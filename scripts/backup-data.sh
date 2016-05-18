#!/usr/bin/env bash

scripts_dir=/opt/admin/posm-admin/scripts
timestamp=`date +%Y%m%d-%H%M:%S`

# back up osm api database
sudo -u postgres $scripts_dir/postgres_api-db-backup.sh /opt/data/osm/

# back up field papers production database
$scripts_dir/root_fp-production-db-backup.sh /opt/data/fieldpapers/

#back up field papers atlases & snapshots

# back up omk forms and submissions
mkdir /opt/data/omk/$timestamp

cp -a /opt/omk/OpenMapKitServer/data/. /opt/data/omk/$timestamp/
