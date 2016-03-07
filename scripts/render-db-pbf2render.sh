#!/usr/bin/env bash

api_db_dumps_dir=/opt/data/api-db-dumps/

# file in dumps dir with latest timestamp
newest_dump=$(ls -r $api_db_dumps_dir | head -1)
newest_dump_path=$api_db_dumps_dir$newest_dump

mem=$(awk 'NR == 1 { print int($2*.9/1024) } ' /proc/meminfo)

echo "==> render-db-pbf2render.sh: Building Render DB from PBF dump via osm2pgsql."
echo "      Using PBF: "$newest_dump_path

osm2pgsql \
    --create \
    --hstore-all \
    --hstore-add-index \
    --extra-attributes \
    --slim \
    --drop \
    --unlogged \
    --database='gis' \
    -C $mem \
    --number-processes $(nproc) $newest_dump_path

echo
echo "==> render-db-pbf2render.sh: END"
echo
