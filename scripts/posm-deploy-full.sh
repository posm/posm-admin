#!/usr/bin/env bash

hot_export_url=$1

# Fetch HOT Export
uuid=$(uuidgen)
tmp_dir=/opt/admin/tmp/$uuid
./hot-export-fetch.sh $hot_export_url $tmp_dir

# Move aoi from temp to aoi dir
manifest_path=$tmp_dir/manifest.json
aoi_name=$(cat $manifest_path | jq -r '.name')
aoi_dir=/opt/data/aoi/$aoi_name
echo "==> posm-deploy-full.sh"
echo "      aoi name: "$aoi_name
echo
./hot-export-move.sh $tmp_dir $aoi_dir

# Convert XLS to XForm
omk_dir=/opt/omk/OpenMapKitServer
pyxform=$omk_dir/api/odk/pyxform/pyxform/xls2xform.py
omk_forms_dir=$omk_dir/data/forms
./xls2xform.sh $pyxform $aoi_dir $omk_forms_dir

# Drop and create API DB
# sudo -u postgres /opt/admin/posm-admin/scripts/postgres_api-db-drop-create.sh
scripts_dir=/opt/admin/posm-admin/scripts/
sudo -u postgres $scripts_dir/postgres_api-db-drop-create.sh

# Init API DB
# sudo -u osm /opt/admin/posm-admin/scripts/osm_api-db-init.sh
sudo -u osm $scripts_dir/osm_api-db-init.sh

# Populate API DB
# sudo -u osm /opt/admin/posm-admin/scripts/osm_api-db-populate.sh /opt/data/aoi/huaquillas
sudo -u osm $scripts_dir/osm_api-db-populate.sh $aoi_dir

# Dump API DB to a PBF (Osmosis)
# sudo -u osm /opt/admin/posm-admin/scripts/render-db-api2pbf.sh
sudo -u osm $scripts_dir/render-db-api2pbf.sh

# Reset and populate Render DB with latest PBF dump (osm2pgsql)
# sudo -u gis /opt/admin/posm-admin/scripts/render-db-pbf2render.sh
sudo -u gis $scripts_dir/render-db-pbf2render.sh

# Reset configs for tessera and field papers. Reset services.
# ./tessera-fp-reset.js /opt/data/aoi/huaquillas/manifest.json
./tessera-fp-reset.js $aoi_dir/manifest.json

# Create OSM XML layers for OpenMapKit
./omk-osm.sh $aoi_dir

# Create POSM MBTiles for OpenMapKit
sudo -u gis $scripts_dir/omk-mbtiles.sh $aoi_dir
