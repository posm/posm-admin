#!/usr/bin/env bash

scripts_dir=/opt/admin/posm-admin/scripts

#back up api-db
sudo -u postgres $scripts_dir/osm_api-db-backup.sh /opt/data/api-db-dumps/