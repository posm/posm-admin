#!/usr/bin/env bash
# $1 - the path of the deployment

POSM_MAPNIK_XML=/opt/gis/posm-carto/project.xml
DEFAULT_MIN_ZOOM=13
DEFAULT_MAX_ZOOM=20

deployment_path=$1
manifest_path=$1/manifest.json
derivatives_path=$deployment_path/derivatives
deployment_name=$(cat $manifest_path | jq -r '.name')

mkdir -p $derivatives_path

bbox_left=$(cat $manifest_path | jq '.bbox[0]')
bbox_bottom=$(cat $manifest_path | jq '.bbox[1]')
bbox_right=$(cat $manifest_path | jq '.bbox[2]')
bbox_top=$(cat $manifest_path | jq '.bbox[3]')
bbox_str="\"$bbox_left $bbox_bottom $bbox_right $bbox_top\""

echo ''
echo '==> omk-mbtiles.sh: Creating POSM MBTiles for OpenMapKit.'
echo '        Min Zoom: '$DEFAULT_MIN_ZOOM
echo '        Max Zoom: '$DEFAULT_MAX_ZOOM
echo ''

tl copy \
  mapnik://$POSM_MAPNIK_XML \
  mbtiles://$derivatives_path/$deployment_name-posm.mbtiles \
  -b $bbox_str \
  -z $DEFAULT_MIN_ZOOM \
  -Z $DEFAULT_MAX_ZOOM

echo "==> omk-mbtiles.sh: END"
