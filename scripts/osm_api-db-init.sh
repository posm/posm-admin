#!/usr/bin/env bash

# Initializes an API DB
# intended to be run as osm

set -eo pipefail

if [ $(whoami) != "osm" ]; then
  >&2 echo $0 is intended to run as osm
  exit 1
fi

echo "==> api-db-init.sh : Initializing API DB with rake db:migrate."
echo

set -a

source /opt/osm/osm-web/.env

set +a

cd /opt/osm/osm-web && bundle exec rake db:migrate

echo "==> api-db-init.sh : END"
echo
