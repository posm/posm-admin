#!/bin/sh

# Change DEFAULT_CENTER in fp-web's upstart
# intended to be run as root

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

# sudo /opt/admin/posm-admin/scripts/root_change-fp-center.sh 2 0.01 20.01
sed -ri "s/(env DEFAULT_CENTER=)\"?.+\"?$/\1\"${1}\/${2}\/${3}\"/" /etc/init/fp-web.conf

service fp-web restart
