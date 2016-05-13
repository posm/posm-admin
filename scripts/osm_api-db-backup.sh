#!/bin/bash

# example
# sh db_backup.sh yeezy ~/Desktop/YeezyBackups

echo '=> db_backup.sh'

db_name=$1
backup_path=$2

# date format: YYYYMMDD-HH-MM/SS
dump_dir=$backup_path`date +%Y%m%d-%H%M:%S`

echo '=> Backing up database: '$db_name 'to: ' $dump_dir
#create backup directory
mkdir $dump_dir
echo '=> Dumping database...'
#dump db
sudo -u osm pg_dump $db_name | gzip > $dump_dir/$db_name.sql.gz

echo '=> Complete...'
