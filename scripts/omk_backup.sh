#!/usr/bin/env bash

set -eo pipefail

backups_dir=/opt/data/backups
timestamp=$(date +%Y%m%d%H%M%S)

if [ $(whoami) != "omk" ]; then
  >&2 echo $0 is intended to run as omk
  exit 1
fi

echo "==> $0: Backing up OMK data..."
echo

tar zcf $backups_dir/omk/${timestamp}.tar.gz -C /opt/data/omk forms/ submissions/

echo "==> $0: END."
echo
