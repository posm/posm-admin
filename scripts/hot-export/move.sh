#!/usr/bin/env bash
mkdir -p $2/contents
mv $1/manifest.json $2
mv $1/* $2/contents
