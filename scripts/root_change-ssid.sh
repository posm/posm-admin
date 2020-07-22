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
sed -ri "s/^(ssid2=).*/\1\"${new_ssid}\"/" /etc/hostapd/hostapd.conf

# Since on reboot hostapd reads the config from /root/etc instead from /etc,
# Make corresponding changes inside /root/etc as well. This will fix the issue
# of SSID not being reset on reboot.
jq ". | .posm_ssid |= \"$new_ssid\"" /root/etc/posm.json | sponge /root/etc/posm.json
sed -ri "s/^(ssid2=).*/\1\"${new_ssid}\"/" /root/etc/hostapd.conf

killall -HUP hostapd

echo "==> $0: END."
echo
