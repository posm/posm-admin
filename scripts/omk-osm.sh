#!/usr/bin/env bash

set -eo pipefail

# $1 - the path of the deployment
deployment_dir=$1
manifest_path=$1/manifest.json
deployment_name=$(cat $manifest_path | jq -r '.name')

convert_pbf_to_xml() {
    filename=$(basename "$1")
    pbf_name="${filename%.*}" # the name of the pbf without extension

    buildings_xml=$pbf_name-buildings.osm
    pois_xml=$pbf_name-pois.osm

    # Buildings
    echo ''
    echo '==> omk-osm.sh: Creating buildings OSM XML for OpenMapKit'
    echo ''
    osmosis --read-pbf $1 \
        --tf accept-ways building=* \
        --used-node \
        --write-xml $deployment_dir/$buildings_xml

    # POIs
    echo ''
    echo '==> omk-osm.sh: Creating POIs OSM XML for OpenMapKit'
    echo ''
    osmosis --read-pbf $1 \
        --node-key keyList="name,amenity,shop,man_made,office,religion,cuisine,highway,shelter" \ # TODO: find a way to just get any node with a tag
        --write-xml $deployment_dir/$pois_xml

}

for pbf in $(find $deployment_dir -iname '*.pbf')
do
	convert_pbf_to_xml $pbf
done

echo "==> omk-osm.sh: END"
echo
