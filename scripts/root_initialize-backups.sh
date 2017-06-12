#!/usr/bin/env bash

set -eo pipefail

backups_dir=/opt/data/backups

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

echo "==> $0: Initializing backup directories..."
echo

mkdir -p ${backups_dir}/{fieldpapers,omk,osm}
chown fp:fp ${backups_dir}/fieldpapers
chown omk:omk ${backups_dir}/omk
chown osm:osm ${backups_dir}/osm

echo "==> $0: END."
echo
