#!/usr/bin/env bash
# Moves a deployment from a directory directory to the proper spot in the data directory.
# Puts the contents in a contents directory.
# args: tmpDir, deploymentDir
mkdir -p $2/contents
mv $1/* $2
rm -rf $1

echo "hot-export-move.sh : The hot export has been moved into a new deployments directory."
