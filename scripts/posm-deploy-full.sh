#!/usr/bin/env bash

# This script will do the complete deployment of an AOI from a HOT Export AOI tar.gz.
# This amalgamation of scripts provisions the POSM with AOI data, and sets up
# XLS Forms, the API DB, and the Render DB.
#
# Once this is set up, you can use omk-atlas.js to create a deployment for OpenMapKit
# based off of a Field Papers atlas' map.geojson

# Arguments:
# $1 - The url to the HOT Export

# Example Usage:
# /opt/admin/posm-admin/scripts/posm-deploy-full.sh http://spatialserver.spatialdev.com/omk/samples/huaquillas-sm.tar.gz

hot_export_url=$1

scripts_dir=/opt/admin/posm-admin/scripts/

# Fetch HOT Export
# /opt/admin/posm-admin/scripts/hot-export-fetch.sh http://spatialserver.spatialdev.com/omk/samples/huaquillas-sm.tar.gz /opt/admin/tmp/example
# /opt/admin/posm-admin/scripts/hot-export-fetch.sh http://ec2-52-32-62-7.us-west-2.compute.amazonaws.com/downloads/c6509d34-68ff-474b-ab93-8bc69d47a00b/huaquillas_el_oro_ecuador-bundle.tar.gz /opt/admin/tmp/example
uuid=$(uuidgen)
tmp_dir=/opt/admin/tmp/$uuid
$scripts_dir/hot-export-fetch.sh $hot_export_url $tmp_dir

# Move aoi from temp to aoi dir
# /opt/admin/posm-admin/scripts/hot-export-move.sh /opt/admin/tmp/example /opt/data/aoi/huaquillas
manifest_path=$tmp_dir/manifest.json
aoi_name=$(cat $manifest_path | jq -r '.name')
aoi_dir=/opt/data/aoi/$aoi_name
echo "==> posm-deploy-full.sh"
echo "      aoi name: "$aoi_name
echo
$scripts_dir/hot-export-move.sh $tmp_dir $aoi_dir

# Activate aoi
curl --data "aoi_name=$aoi_name" http://posm.io/posm-admin/status/activate-aoi

# Drop and create API DB
# sudo -u postgres /opt/admin/posm-admin/scripts/postgres_api-db-drop-create.sh
sudo -u postgres $scripts_dir/postgres_api-db-drop-create.sh

# Init API DB
# sudo -u osm /opt/admin/posm-admin/scripts/osm_api-db-init.sh
sudo -u osm $scripts_dir/osm_api-db-init.sh

# Populate API DB
# sudo -u osm /opt/admin/posm-admin/scripts/osm_api-db-populate.sh /opt/data/aoi/huaquillas
sudo -u osm $scripts_dir/osm_api-db-populate.sh $aoi_dir

# Dump API DB to a PBF (Osmosis)
# sudo -u osm /opt/admin/posm-admin/scripts/osm_render-db-api2pbf.sh
sudo -u osm $scripts_dir/osm_render-db-api2pbf.sh

# Reset and populate Render DB with latest PBF dump (osm2pgsql)
# sudo -u gis /opt/admin/posm-admin/scripts/gis_render-db-pbf2render.sh
sudo -u gis $scripts_dir/gis_render-db-pbf2render.sh

# Reset configs for tessera and field papers. Reset services.
# /opt/admin/posm-admin/scripts/tessera-fp-reset.js /opt/data/aoi/huaquillas/manifest.json
$scripts_dir/tessera-fp-reset.js $aoi_dir/manifest.json
