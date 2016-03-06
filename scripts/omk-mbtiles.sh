#!/usr/bin/env bash

# $1 - the path of the deployment
deployment_path=$1
manifest_path=$1/manifest.json
derivatives_path=$deployment_path/derivatives
mkdir -p $derivatives_path
deployment_name=$(cat $manifest_path | jq -r '.name')

bbox_left=$(cat $manifest_path | jq '.bbox[0]')
bbox_bottom=$(cat $manifest_path | jq '.bbox[1]')
bbox_right=$(cat $manifest_path | jq '.bbox[2]')
bbox_top=$(cat $manifest_path | jq '.bbox[3]')

