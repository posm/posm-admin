#!/usr/bin/env bash

# $1 - the path of the deployment
deployment_dir=/opt/data/deployments/$1
manifest_path=$deployment_dir/manifest.json
deployment_name=$(cat $manifest_path | jq -r '.name')

left=$(cat $manifest_path | jq -r '.bbox[0]')
bottom=$(cat $manifest_path | jq -r '.bbox[1]')
right=$(cat $manifest_path | jq -r '.bbox[2]')
top=$(cat $manifest_path | jq -r '.bbox[3]')


convert_pbf_to_xml() {
    filename=$(basename "$1")
    pbf_name="${filename%.*}" # the name of the pbf without extension

    buildings_xml=$deployment_name-buildings.osm
    pois_xml=$deployment_name-pois.osm

    # Buildings
    echo ''
    echo '==> omk-osm.sh: Creating buildings OSM XML for OpenMapKit'
    echo ''
    osmosis --read-pbf $1 \
        --tf accept-ways building=* \
        --used-node \
        --bounding-box left=$left bottom=$bottom right=$right top=$top \
        --write-xml $deployment_dir/$buildings_xml

    # POIs
    echo ''
    echo '==> omk-osm.sh: Creating POIs OSM XML for OpenMapKit'
    echo ''
    osmosis --read-pbf $1 \
        --node-key keyList="name,amenity,shop,man_made,office,religion,cuisine,highway,shelter" \
        --bounding-box left=$left bottom=$bottom right=$right top=$top \
        --write-xml $deployment_dir/$pois_xml

}

convert_pbf_to_xml /opt/data/deployments/north_liberia/osm/north_liberia-full.pbf

echo "==> omk-osm.sh: END"
echo
