#!/usr/bin/env bash

set -eo pipefail

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

echo "==> $0: Changing SSID."
echo

if [[ $1 == "" ]]; then
  >&2 echo "Usage: $0 <new SSID>"
  exit 1
fi

new_ssid=$1

jq ". | .posm_ssid |= \"$new_ssid\"" /etc/posm.json | sponge /etc/posm.json
sed -ri "s/^(ssid=).*/\1\"${new_ssid}\"/" /etc/hostapd/hostapd.conf

killall -HUP hostapd

echo "==> $0: END."
echo
