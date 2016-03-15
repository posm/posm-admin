#!/usr/bin/env bash

aoi_dir_path=$1
write_path=$2

left=$3
bottom=$4
right=$5
top=$6

POSM_MAPNIK_XML=/opt/gis/posm-carto/project.xml

cut_bbox() {
    echo
    echo '==> gis_omk-aoi-mbtiles.sh: Creating POSM MBTiles for OpenMapKit.'
    echo '      write_path: '$write_path
    echo "      bbox: ${left} ${bottom} ${right} ${top}"
    echo

    aoi_path=$1
    fname=$(basename "$aoi_path")
    aoi_name="${fname%.*}"

    tl copy \
      "mbtiles://$aoi_path" \
      "mbtiles://${write_path} ${aoi_name}.mbtiles" \
      -b "$left $bottom $right $top"

}

for aoi in $(find $aoi_dir_path -iname '*.mbtiles')
do
	cut_bbox $aoi
done

echo "==> gis_omk-aoi-mbtiles.sh: END"
echo
