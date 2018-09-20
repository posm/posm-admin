#!/usr/bin/env bash

set -eo pipefail

if [ $(whoami) != "postgres" ]; then
  >&2 echo $0 is intended to run as postgres
  exit 1
fi

echo "==> $0: Dropping and re-creating the API DB."
echo

# Drops connections to database that might prevent us from recreating the db.
sudo service osm-cgimap stop
sudo service osm-web stop

# Drops and creates osm database.
dropdb osm
createdb --owner='osm' 'osm'

sudo service osm-cgimap start
sudo service osm-web start

# OSM specific native functions.
psql -d osm -c "CREATE EXTENSION btree_gist"
psql -d osm -c "CREATE FUNCTION maptile_for_point(int8, int8, int4) RETURNS int4 AS '/opt/osm/osm-web/db/functions/libpgosm', 'maptile_for_point' LANGUAGE C STRICT"
psql -d osm -c "CREATE FUNCTION tile_for_point(int4, int4) RETURNS int8 AS '/opt/osm/osm-web/db/functions/libpgosm', 'tile_for_point' LANGUAGE C STRICT"
psql -d osm -c "CREATE FUNCTION xid_to_int4(xid) RETURNS int4 AS '/opt/osm/osm-web/db/functions/libpgosm', 'xid_to_int4' LANGUAGE C STRICT"

echo "==> api-db-drop-create.sh: END"
echo
