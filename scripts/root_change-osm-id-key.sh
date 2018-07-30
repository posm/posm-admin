#!/usr/bin/env bash

# Change OSM_ID_KEY in osm-web's service definition
# intended to be run as root

set -eo pipefail

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

sed -ri "s/(Environment=OSM_ID_KEY=)\".+\"$/\1\"${1}\"/" /etc/systemd/system/osm-web.service

systemctl daemon-reload
service osm-web restart
