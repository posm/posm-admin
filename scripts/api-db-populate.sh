#!/usr/bin/env bash
# args: deploymentContentsDir
for pbf in $(find $2 -iname '*.pbf')
do
	osmosis --read-pbf-fast $pbf \
  		--log-progress \
  		--write-apidb password=openstreetmap database=osm validateSchemaVersion=no
done

psql -d osm -c "select setval('changesets_id_seq', (select max(id) from changesets))"
psql -d osm -c "select setval('current_nodes_id_seq', (select max(node_id) from nodes))"
psql -d osm -c "select setval('current_ways_id_seq', (select max(way_id) from ways))"
psql -d osm -c "select setval('current_relations_id_seq', (select max(relation_id) from relations))"
psql -d osm -c "select setval('users_id_seq', (select max(id) from users))"

echo "EXECUTED: api-db-populate.sh"
