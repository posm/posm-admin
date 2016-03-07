#!/usr/bin/env bash

echo "==> api-db-init.sh : Initializing API DB with rake db:migrate."
echo

set -a

source /opt/osm/osm-web/.env

set +a

cd /opt/osm/osm-web && bundle exec rake db:migrate

echo "==> api-db-init.sh : END"
echo
