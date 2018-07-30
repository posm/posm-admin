#!/usr/bin/env bash

# Change DEFAULT_CENTER in fp-web's service definition
# intended to be run as root

set -eo pipefail

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

# sudo /opt/admin/posm-admin/scripts/root_change-fp-center.sh 2 0.01 20.01
# TODO use a systemd environment file instead
sed -ri "s/(Environment=DEFAULT_CENTER=)\"?.+\"?$/\1\"${1}\/${2}\/${3}\"/" /etc/systemd/system/fp-web.service

systemctl daemon-reload
service fp-web restart
