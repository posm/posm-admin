#!/usr/bin/env bash
# Moves a deployment from a directory directory to the proper spot in the data directory.
# Puts the contents in a contents directory.
mkdir -p $2/contents
mv $1/manifest.json $2
mv $1/* $2/contents
rm -rf $1
