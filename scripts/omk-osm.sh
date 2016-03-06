#!/usr/bin/env bash

# $1 - the path of the deployment
deployment_path=$1
manifest_path=$1/manifest.json
derivatives_path=$deployment_path/derivatives
mkdir -p $derivatives_path
deployment_name=$(cat $manifest_path | jq -r '.name')

convert_pbf_to_xml() {
    pbf=$deployment_path/contents/$1
    derivatives=$deployment_path/derivatives
    buildings_xml=$derivatives/$deployment_name-buildings.osm
    pois_xml=$derivatives/$deployment_name-pois.osm

    # Buildings
    echo ''
    echo '==> omk-osm.sh: Creating buildings OSM XML for OpenMapKit using Osmosis.'
    echo ''
    osmosis --read-pbf $pbf \
        --tf accept-ways building=* \
        --used-node \
        --write-xml $buildings_xml

    # POIs
    echo ''
    echo '==> omk-osm.sh: Creating POIs OSM XML for OpenMapKit using Osmosis.'
    echo ''
    osmosis --read-pbf $pbf \
        --tf accept-ways building=* \
        --used-node \
        --write-xml $buildings_xml

}

contents_keys=$(cat $manifest_path | jq -r '.contents | keys | .[]')
for key in $contents_keys
do
    type=$(cat $manifest_path | jq -r '.contents | .["'$key'"].type')
    if [ $type = 'OSM/PBF' ]; then
        convert_pbf_to_xml $key
    fi
done
