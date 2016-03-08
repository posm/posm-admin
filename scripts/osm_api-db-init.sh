#!/bin/sh

echo "==> api-db-init.sh : Initializing API DB with rake db:migrate."
echo

set -a

source /opt/osm/osm-web/.env

set +a

cd /opt/osm/osm-web && bundle exec rake db:migrate

# re-create a ClientApplication entry for iD
echo "==> creating credentials for iD"
posm_base_url=$(jq -r .posm_base_url /etc/posm.json)
osm_id_key=$(cd '/opt/osm/osm-web' && bundle exec rake osm:apps:create name='OSM iD' url='${posm_base_url}' | jq -r .key)

# re-create the POSM user
echo "==> creating a POSM account"
osm_posm_user=$(jq -r .osm_posm_user /etc/posm.json)
osm_posm_description=$(jq -r .osm_posm_description /etc/posm.json)
cd '/opt/osm/osm-web' && bundle exec rake osm:users:create display_name='${osm_posm_user}' description='${osm_posm_description}'

# change the OSM iD key
echo "==> changing OSM iD key as root"
sudo /opt/admin/posm-admin/scripts/root_change-osm-id-key.sh $osm_id_key

echo "==> api-db-init.sh : END"
echo
