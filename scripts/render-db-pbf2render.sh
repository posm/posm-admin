#!/usr/bin/env bash

mem=$(awk 'NR == 1 { print int($2*.9/1024) } ' /proc/meminfo)
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
--number-processes $(nproc) $1

echo "Imported PBF into Rendering DB."
