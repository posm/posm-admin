#!/usr/bin/env bash

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

temp_db=gis_temp
mem=$(awk 'NR == 1 { print int($2*.9/1024) } ' /proc/meminfo)

echo "==> gis_render-db-pbf2render.sh: Building Render DB from PBF dump via osm2pgsql."
echo "      Using PBF: "$dump_path
echo "      Populating DB: "$temp_db

osm2pgsql \
    --create \
    --hstore-all \
    --hstore-add-index \
    --extra-attributes \
    --slim \
    --drop \
    --unlogged \
    --database=$temp_db \
    -C $mem \
    --number-processes $(nproc) $dump_path

psql -d postgres -c "ALTER DATABASE gis RENAME TO gis_temp2;";
psql -d postgres -c "ALTER DATABASE gis_temp RENAME TO gis;";
psql -d postgres -c "ALTER DATABASE gis_temp2 RENAME TO gis_temp;";
echo "==> gis_render-db-pbf2render.sh: Moved gis_temp to gis."

echo
echo "==> gis_render-db-pbf2render.sh: END"
echo
