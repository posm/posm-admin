#!/bin/sh

# Change OSM_ID_KEY in osm-web's upstart
# intended to be run as root

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

sed -ri "s/(env OSM_ID_KEY=)\".+\"$/\1\"${1}\"/" /etc/init/osm-web.conf

service osm-web restart
