#!/usr/bin/env bash

set -eo pipefail

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

echo "==> root_change-network-mode.sh: Changing Network Mode."
echo

if [[ $1 == "" ]]; then
  >&2 echo "Usage: $0 <bridge|captive>"
  exit 1
fi

case "$1" in
  bridge)
    /root/scripts/bootstrap.sh bridge
    ;;
  captive)
    /root/scripts/bootstrap.sh captive
    ;;
  *)
    >&2 echo "Usage: $0 <bridge|captive>"
    exit 1
    ;;
esac

echo "==> root_change-network-mode.sh: END."
echo