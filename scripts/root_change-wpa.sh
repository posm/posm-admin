#!/usr/bin/env bash

set -eo pipefail

if [ $(whoami) != "root" ]; then
  >&2 echo $0 is intended to run as root
  exit 1
fi

echo "==> $0: Changing WPA."
echo

if [[ $1 == "" ]]; then
  >&2 echo "Usage: $0 <WPA value>"
  exit 1
fi

new_wpa=$1

jq ". | .posm_wifi_wpa |= \"$new_wpa\"" /etc/posm.json | sponge /etc/posm.json
sed -ri "s/^(wpa=).*/\1${new_wpa}/" /etc/hostapd/hostapd.conf

killall -HUP hostapd

echo "==> $0: END."
echo
