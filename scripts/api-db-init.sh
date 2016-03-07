#!/usr/bin/env bash

echo "==> api-db-init.sh : Initializing API DB with rake db:migrate."
echo

# FIXME Temporary hard- coding of environment variables.
set -a
RAILS_ENV="production"
RAILS_RELATIVE_URL_ROOT="/osm"
SECRET_KEY_BASE=38ab4c0de2a6335be2d2c6f6972470f0dc4f750f5c8f5895e53e8a5889fcccfeeda82a29d99ce9d0860e7f10c39bc88f6b17ed4bcc8218cef3e2fec020706129
RAILS_SERVE_STATIC_FILES=true
DATABASE_URL="postgres://osm:openstreetmap@localhost/osm"

cd /opt/osm/osm-web && bundle exec rake db:migrate

set +a

echo "==> api-db-init.sh : END"
