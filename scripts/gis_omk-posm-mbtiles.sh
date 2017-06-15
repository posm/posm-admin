#!/usr/bin/env bash

set -eo pipefail

path=$1

left=$2
bottom=$3
right=$4
top=$5

POSM_MAPNIK_XML=/opt/gis/posm-carto/project.xml
DEFAULT_MIN_ZOOM=13
DEFAULT_MAX_ZOOM=22

if [ $(whoami) != "gis" ]; then
  >&2 echo $0 is intended to run as gis
  exit 1
fi

echo
echo "==> $0: Creating POSM MBTiles for OpenMapKit."
echo '      path: '$path
echo "      bbox: ${left} ${bottom} ${right} ${top}"
echo '      Min Zoom: '$DEFAULT_MIN_ZOOM
echo '      Max Zoom: '$DEFAULT_MAX_ZOOM
echo

tl copy \
  mapnik://$POSM_MAPNIK_XML \
  "mbtiles://$path" \
  -b "$left $bottom $right $top" \
  -z $DEFAULT_MIN_ZOOM \
  -Z $DEFAULT_MAX_ZOOM

# mbtiles uri encodes the file. we dont want that...
uri_path=$(python -c "import urllib, sys; print urllib.quote(sys.argv[1])" "${path}")
mv "${uri_path}" "${path}"

echo "==> $0: END"
echo
