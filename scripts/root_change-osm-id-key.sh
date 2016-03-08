#!/bin/sh

# Change OSM_ID_KEY in osm-web's upstart
# intended to be run as root

sed -ri "s/(env OSM_ID_KEY=)\".+\"$/\1\"${1}\"/" /etc/init/osm-web.conf

service osm-web restart
