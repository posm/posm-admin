#!/usr/bin/env bash
mkdir -p $2
curl $1 | pv | tar zxf - -C $2
