#!/usr/bin/env bash
# $1 - xls2xform.py in pyxform
# $2 - aoi dir
# $3 - OMK forms dir

set -eo pipefail

for xlsx in $(find $2 -iname '*.xlsx')
do
    echo "==> $0: Converting XLSX to XForm XML."
    echo "      xlsx:  "$xlsx

    # Copy the xlsx file into the forms dir
    cp $xlsx $3

    # Figure out the path of the new XForm xml
    xlsxFileName=$(basename $xlsx)
    fileNameNoExt=${xlsxFileName%.*}
    xml=$3'/'$fileNameNoExt'.xml'
    echo "      xform: "$xml
    echo

    # Execute pyxform xml2xform.py
    python $1 $xlsx $xml
done

echo "==> $0: END"
echo
