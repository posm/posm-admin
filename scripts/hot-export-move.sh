#!/usr/bin/env bash
# Moves a deployment from a directory directory to the proper spot in the data directory.
# Puts the contents in a contents directory.
# args: tmpDir, deploymentDir
mkdir -p $2/contents
mv $1/* $2
rm -rf $1
