#!/usr/bin/env bash

path=$1

left=$2
bottom=$3
right=$4
top=$5

echo '==> osm_omk-osm.sh'
echo '      path: '$path
echo "      bbox: [$(left), $(bottom), $(right), $(top)]"

# Buildings
echo ''
echo '==> osm_omk-osm.sh: Creating buildings OSM XML for OpenMapKit'
echo ''
osmosis --read-apidb \
            database=osm \
            user=osm \
            password=openstreetmap \
            validateSchemaVersion=no \
    --bounding-box left=$left bottom=$bottom right=$right top=$top completeRelations \
    --write-xml file=$path

# POIs
echo ''
echo '==> osm_omk-osm.sh: Creating POIs OSM XML for OpenMapKit'
echo ''
osmosis --read-apidb \
            database=osm \
            user=osm \
            password=openstreetmap \
            validateSchemaVersion=no \
    --tf accept-ways building=* \
    --used-node \
    --node-key keyList="name,amenity,shop,man_made,office,religion,cuisine,highway,shelter" \
    --bounding-box left=$left bottom=$bottom right=$right top=$top completeRelations \
    --write-xml file=$path

echo "==> osm_omk-osm.sh: END"
echo
