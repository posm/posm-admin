#!/usr/bin/env bash

# This script will do the complete deployment of an existing AOI from disk.
# This amalgamation of scripts sets up the API DB, and the Render DB.
#
# Once this is set up, you can use omk-atlas.js to create a deployment for OpenMapKit
# based off of a Field Papers atlas' map.geojson

# Arguments:
# $1 - The name (directory) of the AOI

# Example Usage:
# /opt/admin/posm-admin/scripts/posm-aoi-reset.sh huaquillas

set -eo pipefail

scripts_dir=/opt/admin/posm-admin/scripts/

aoi_name=$1
aoi_dir=/opt/data/aoi/$aoi_name
echo "==> posm-aoi-reset.sh"
echo "      aoi name: "$aoi_name

# Activate aoi
curl -f --data "aoi_name=$aoi_name" "$(jq -r .posm_base_url /etc/posm.json)/posm-admin/status/activate-aoi"

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
