#!/usr/bin/env bash
# Moves a deployment from a temporary directory to the proper spot in the data directory.
# Puts the contents in a contents directory.
# args: tmpDir, deploymentDir

set -eo pipefail

echo "==> $0: Moving deployment from temporary directory to the deployments directory."
echo "      temp dir:       "$1
echo "      deployment dir: "$2
echo

rm -rf $2
mkdir -p $2
mv $1/* $2
rm -rf $1

echo "==> $0: END"
echo
