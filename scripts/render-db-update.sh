#!/bin/sh

scripts_dir=/opt/admin/posm-admin/scripts/

echo "==> render-db-update.sh: Dumping API DB and updating Render DB (used by cron)."

# sudo -u osm /opt/admin/posm-admin/scripts/osm_render-db-api2pbf.sh render-db-update-dump.pbf
sudo -u osm $scripts_dir/osm_render-db-api2pbf.sh 0_render-db-update-dump.pbf

# sudo -u gis /opt/admin/posm-admin/scripts/gis_render-db-pbf2render.sh render-db-update-dump.pbf
sudo -u gis $scripts_dir/gis_render-db-pbf2render.sh 0_render-db-update-dump.pbf

echo "==> render-db-update.sh: Restarting tessera."
sudo service tessera restart

echo "==> render-db-update.sh: END"
echo
