#!/usr/bin/env bash
# $1 - xls2xform.py in pyxform
# $2 - deployment contents dir
# $3 - OMK forms dir
for xlsx in $(find $2 -iname '*.xlsx')
do
    # Copy the xlsx file into the forms dir
    cp $xlsx $3

    # Figure out the path of the new XForm xml
    xlsxFileName=$(basename $xlsx)
    fileNameNoExt=${xlsxFileName%.*}
    xml=$3'/'$fileNameNoExt'.xml'

    # Execute pyxform xml2xform.py
    python $1 $xlsx $xml
done

echo "xls2xform.sh : .xlsx file converted to XForms XML"
