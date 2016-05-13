#!/usr/bin/env bash

scripts_dir=/opt/admin/posm-admin/scripts

#back up osm api database
sudo -u postgres $scripts_dir/osm_api-db-backup.sh /opt/data/api-db-dumps/

#back up fieldpapers production database
$scripts_dir/root_fp-production-db-backup.sh /opt/data/fp-db-dumps/