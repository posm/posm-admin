#!/usr/bin/env bash

set -eo pipefail

aoi_dir_path=$1
write_path=$2

left=$3
bottom=$4
right=$5
top=$6

POSM_MAPNIK_XML=/opt/gis/posm-carto/project.xml

cut_bbox() {
    aoi_path=$1
    fname=$(basename "$aoi_path")
    aoi_name="${fname%.*}"
    write_file="${write_path} ${aoi_name}.mbtiles"

    echo
    echo '==> gis_omk-aoi-mbtiles.sh: Creating AOI MBTiles Extract for OpenMapKit.'
    echo '      $aoi_path: '$aoi_path
    echo '      $write_file: '$write_file
    echo "      bbox: ${left} ${bottom} ${right} ${top}"
    echo

    tl copy \
      "mbtiles://$aoi_path" \
      "mbtiles://${write_file}" \
      -b "$left $bottom $right $top"

    # mbtiles uri encodes the file. we dont want that...
    uri_path=$(python -c "import urllib, sys; print urllib.quote(sys.argv[1])" "${write_file}")
    mv "${uri_path}" "${write_file}"

}

for aoi in $(find $aoi_dir_path -iname '*.mbtiles')
do
	cut_bbox $aoi
done

echo "==> gis_omk-aoi-mbtiles.sh: END"
echo
