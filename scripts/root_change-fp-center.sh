#!/bin/sh

# Change DEFAULT_CENTER in fp-web's upstart
# intended to be run as root

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

sed -ri "s/(env DEFAULT_CENTER=)\".+\"$/\1\"${1}\"/" /etc/init/fp-web.conf

# We don't need to reset the fp-web service quite yet, because we will be
# restarting it anyway in the conclusion of tessera-fp-reset.js
#
# service fp-web restart
