#!/usr/bin/env bash

set -eo pipefail

api_db_dumps_dir=/opt/data/api-db-dumps/

timestamp_pbf() {
    date +'%FT%TZ.pbf'
}

if [ -z "$1" ]; then
    # no file name argument, creating a file with a timestamp in the name
    file_path=$api_db_dumps_dir$(timestamp_pbf)
else
    # file name provided, creating a file with the name provided as arg $1
    file_path=$api_db_dumps_dir$1
fi

echo "==> osm_render-db-api2pbf.sh: Dumping the API DB to a PBF."
echo "        pbf dump: $file_path"
echo

osmosis --read-apidb \
    database=osm \
    user=osm \
    password=openstreetmap \
    validateSchemaVersion=no \
    --write-pbf file=$file_path

echo
echo "PBF dump written to: $file_path"
echo
echo "==> osm_render-db-api2pbf.sh: END"
echo
