#!/usr/bin/env bash
# Fetches a HOT Export tar.gz, unpacks it, and puts in a directory.
# args: url, tmpDir
echo "==> hot-export-fetch.sh : Fetching and unpacking HOT Export into a temporary directory."
echo

mkdir -p $2
curl $1 | pv | tar zxf - -C $2

echo "==> hot-export-fetch.sh : END"
