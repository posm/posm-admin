#!/usr/bin/env bash

api_db_dumps_dir=/opt/data/api-db-dumps/

timestamp_pbf() {
    date +'%FT%TZ.pbf'
}

file_path=$api_db_dumps_dir$(timestamp_pbf)

echo "==> render-db-api2pbf.sh: Dumping the API DB to a PBF."
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
echo "==> render-db-api2pbf.sh: END"
echo
