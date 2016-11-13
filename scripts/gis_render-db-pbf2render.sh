#!/usr/bin/env bash

set -eo pipefail

api_db_dumps_dir=/opt/data/api-db-dumps/

if [ -z "$1" ]; then
    # no file name argument, using file with latest timestamp
    # file in dumps dir with latest timestamp
    newest_dump=$(ls -r $api_db_dumps_dir | head -1)
    dump_path=$api_db_dumps_dir$newest_dump
else
    # file name provided, using specified file
    dump_path=$api_db_dumps_dir$1
fi

mem=$(awk 'NR == 3 { print int($2*.9/1024) } ' /proc/meminfo)

echo "==> gis_render-db-pbf2render.sh: Building Render DB from PBF dump via osm2pgsql."
echo "      Using PBF: "$dump_path
echo "      Populating DB: "$db

osm2pgsql \
    --create \
    --hstore-all \
    --hstore-add-index \
    --extra-attributes \
    --slim \
    --unlogged \
    --database=$(jq -r .osm_carto_pg_dbname /etc/posm.json) \
    -C $mem \
    --number-processes $(nproc) $dump_path

cp /opt/data/osm/replication/minute/000/000/000.state.txt /opt/data/osm/state.txt

echo
echo "==> gis_render-db-pbf2render.sh: END"
echo
