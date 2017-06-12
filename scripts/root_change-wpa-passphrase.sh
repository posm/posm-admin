#!/usr/bin/env bash

set -eo pipefail

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

echo "==> $0: Changing WPA passphrase."
echo

if [[ $1 == "" ]]; then
  >&2 echo "Usage: $0 <new wpa passphrase>"
  exit 1
fi

new_passphrase=$1

jq ". | .posm_wpa_passphrase |= \"$new_passphrase\"" /etc/posm.json | sponge /etc/posm.json
sed -ri "s/^(wpa_passphrase=).*/\1${new_passphrase}/" /etc/hostapd/hostapd.conf

killall -HUP hostapd

echo "==> $0: END."
echo
