#!/usr/bin/env bash

set -eo pipefail

path=$1

left=$2
bottom=$3
right=$4
top=$5

if [ $(whoami) != "osm" ]; then
  >&2 echo $0 is intended to run as osm
  exit 1
fi

echo "==> $0"
echo '      path: '$path
echo "      bbox: left=${left} bottom=${bottom} right=${right} top=${top}"

# Buildings
echo ''
echo "==> $0: Creating buildings OSM XML for OpenMapKit"
echo ''
osmosis --read-apidb \
            authFile=/etc/osmosis/osm.properties \
            validateSchemaVersion=no \
    --tf accept-ways building=* \
    --used-node \
    --bounding-box left=$left bottom=$bottom right=$right top=$top completeRelations=yes completeWays=yes \
    --write-xml file="${path} Buildings.osm"

# POIs
echo ''
echo "==> $0: Creating POIs OSM XML for OpenMapKit"
echo ''
osmosis --read-apidb \
            authFile=/etc/osmosis/osm.properties \
            validateSchemaVersion=no \
    --node-key keyList="name,amenity,shop,man_made,office,religion,cuisine,highway,shelter" \
    --bounding-box left=$left bottom=$bottom right=$right top=$top completeRelations=yes completeWays=yes \
    --write-xml file="${path} POIs.osm"

echo "==> $0: END"
echo
