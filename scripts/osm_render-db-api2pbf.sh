#!/usr/bin/env bash

set -eo pipefail

api_db_dumps_dir=/opt/data/api-db-dumps/

if [ $(whoami) != "osm" ]; then
  >&2 echo $0 is intended to run as osm
  exit 1
fi

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

echo "==> $0: Dumping the API DB to a PBF."
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
echo "==> $0: END"
echo
