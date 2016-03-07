#!/usr/bin/env bash
# $1 - the path of the deployment

# sudo -u gis /opt/admin/posm-admin/scripts/omk-mbtiles.sh /opt/data/deployments/dvizarasekwa

# tl copy mapnik:///opt/gis/posm-carto/project.xml mbtiles:///opt/data/deployments/dvizarasekwa/derivatives/dvizarasekwa-posm.mbtiles -b "30.904111862182614 -17.821343531895728 30.95578193664551 -17.778602961844793" -z 13 -Z 20

POSM_MAPNIK_XML=/opt/gis/posm-carto/project.xml
DEFAULT_MIN_ZOOM=13
DEFAULT_MAX_ZOOM=20

deployment_path=$1
manifest_path=$1/manifest.json
derivatives_path=$deployment_path/derivatives
deployment_name=$(cat $manifest_path | jq -r '.name')

mkdir -p $derivatives_path
chmod -R a+rwx $derivatives_path

bbox_left=$(cat $manifest_path | jq '.bbox[0]')
bbox_bottom=$(cat $manifest_path | jq '.bbox[1]')
bbox_right=$(cat $manifest_path | jq '.bbox[2]')
bbox_top=$(cat $manifest_path | jq '.bbox[3]')
bbox="$bbox_left $bbox_bottom $bbox_right $bbox_top"

echo ''
echo '==> omk-mbtiles.sh: Creating POSM MBTiles for OpenMapKit.'
echo '        Min Zoom: '$DEFAULT_MIN_ZOOM
echo '        Max Zoom: '$DEFAULT_MAX_ZOOM
echo ''

tl copy \
  mapnik://$POSM_MAPNIK_XML \
  mbtiles://$derivatives_path/$deployment_name-posm.mbtiles \
  -b "$bbox" \
  -z $DEFAULT_MIN_ZOOM \
  -Z $DEFAULT_MAX_ZOOM

echo "==> omk-mbtiles.sh: END"
echo
