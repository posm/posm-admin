#!/usr/bin/env bash
# $1 - xls2xform.py in pyxform
# $2 - deployment contents dir
# $3 - OMK forms dir
for xlsx in $(find $2 -iname '*.xlsx')
do
    echo "==> xls2xform.sh: Converting XLSX to XForm XML."
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

echo "==> xls2xform.sh: END"
echo
