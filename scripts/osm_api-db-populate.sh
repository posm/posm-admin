#!/bin/bash
# args: aoi dir

if [ $(whoami) != "osm" ]; then
  >&2 echo $0 is intended to run as osm
  exit 1
fi

set -a

source /opt/osm/osm-web/.env

set +a

echo "==> api-db-populate.sh: Populating API DB and setting sequences."
echo "      aoi dir: $1"
echo

for pbf in $(find $1 -iname '*.pbf' | head -1); do
	osmosis --read-pbf-fast $pbf \
  		--log-progress \
  		--write-apidb password=openstreetmap database=osm validateSchemaVersion=no
  echo "osmosis import with $pbf"
done

psql -d osm -c "select setval('changesets_id_seq', (select max(id) from changesets))"
psql -d osm -c "select setval('current_nodes_id_seq', (select max(node_id) from nodes))"
psql -d osm -c "select setval('current_ways_id_seq', (select max(way_id) from ways))"
psql -d osm -c "select setval('current_relations_id_seq', (select max(relation_id) from relations))"
psql -d osm -c "select setval('users_id_seq', (select max(id) from users))"
echo "==> api-db-populate.sh: Sequences set."

# re-create a ClientApplication entry for iD
echo "==> creating credentials for iD"
posm_base_url=$(jq -r .posm_base_url /etc/posm.json)
osm_id_key=$(cd '/opt/osm/osm-web' && bundle exec rake osm:apps:create name='OSM iD' url="${posm_base_url}" | jq -r .key)

# re-create the POSM user
echo "==> creating a POSM account"
osm_posm_user=$(jq -r .osm_posm_user /etc/posm.json)
osm_posm_description=$(jq -r .osm_posm_description /etc/posm.json)
cd '/opt/osm/osm-web' && bundle exec rake osm:users:create display_name="${osm_posm_user}" description="${osm_posm_description}"

# change the OSM iD key
echo "==> changing OSM iD key as root"
sudo /opt/admin/posm-admin/scripts/root_change-osm-id-key.sh $osm_id_key

# set the center for the POSM user to be the center of the bbox of the AOI
lat=$(jq -r '(.bbox[1] + .bbox[3]) / 2' $1/manifest.json)
lng=$(jq -r '(.bbox[0] + .bbox[2]) / 2' $1/manifest.json)
echo "==> Setting the center for the POSM user to be the center of the bbox of the AOI."
echo "      lat: $lat"
echo "      lng: $lng"
psql -c "update users set home_lat=${lat}, home_lon=${lng} where display_name='POSM'"

echo "==> api-db-populate.sh: END"
echo
