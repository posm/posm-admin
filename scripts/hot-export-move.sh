#!/usr/bin/env bash
# Moves a deployment from a temporary directory to the proper spot in the data directory.
# Puts the contents in a contents directory.
# args: tmpDir, deploymentDir
echo "==> hot-export-move.sh: Moving deployment from temporary directory to the deployments directory."
echo
mkdir -p $2/contents
mv $1/* $2
rm -rf $1

echo "==> hot-export-move.sh: END"
