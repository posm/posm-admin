#!/usr/bin/env bash

cd /opt/osm/osm-web && bundle exec rake db:migrate

echo "api-db-init.sh : The API DB has been initialized with rake db:migrate."
