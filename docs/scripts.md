# POSM Admin Scripts

The core of POSM Admin is a suite of bash scripts that do the administrative
tasks handling data deployment, operation, and backup of the POSM Server.

The following are the categories of tasks POSM Admin handles:

## POSM Deployment

The area of interest (AOI) a POSM is concerned with encompasses the general
region in which the POSM is to be deployed to in the field. If your mission
is to map the northern border of Libera, for example, your POSM should
be deployed with that entire region surrounding the border in question.

You can use a [custom instance](http://ec2-52-32-62-7.us-west-2.compute.amazonaws.com/en/)
of the HOT Export tool to fetch the OSM data you need for your POSM deployment.
Once that export is completed, you can pass the url of the POSM Bundle
to [`posm-deploy-full.sh`](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/posm-deploy-full.sh).

![](https://cloud.githubusercontent.com/assets/556367/14218394/b6bfe84a-f808-11e5-8d85-f71a4d9b1cde.png)

An example of a POSM Bundle URL:

http://ec2-52-32-62-7.us-west-2.compute.amazonaws.com/downloads/c6509d34-68ff-474b-ab93-8bc69d47a00b/huaquillas_el_oro_ecuador-bundle.tar.gz

With this url, you can run [`posm-deploy-full.sh`](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/posm-deploy-full.sh).

### `[posm-deploy-full.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/posm-deploy-full.sh)`

Takes as a single argument the URL to a HOT Export tar.gz.

```sh
/opt/admin/posm-admin/scripts/posm-deploy-full.sh <export.tar.gz>
```

### Tasks

1. [Fetch HOT Export](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/posm-deploy-full.sh#L20-L25).
    - Fetches a tar.gz containing a `manifest.json`, OSM PBF, and MBTiles.
    - Uses [hot-export-fetch.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/hot-export-fetch.sh)
2. [Move HOT Export to AOI directory](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/posm-deploy-full.sh#L20-L25).
    - Extracts the name of the AOI from the `manifest.json`. Moves the contents into `/opt/data/aoi/<aoi-name>`.
    - Uses [hot-export-move.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/hot-export-move.sh)
3. [Drop and Create API DB](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/posm-deploy-full.sh#L20-L25).
    - Drops the API DB and recreates with appropriate functions and extensions.
    - Uses [postgres_api-db-drop-create.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/postgres_api-db-drop-create.sh)
4. [Init API DB](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/posm-deploy-full.sh#L20-L25).
    - Initializes the API DB with `rake db:migrate`.
    - Uses [osm_api-db-init.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/osm_api-db-init.sh)
5. [Populate API DB](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/posm-deploy-full.sh#L20-L25).
    - Uses `osmosis` to populate the API DB from the AOI's OSM PBF. Does other administrative tasks.
    - Uses [osm_api-db-init.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/osm_api-db-init.sh)
6. [Dump API DB to PB](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/posm-deploy-full.sh#L20-L25)
    - Dumps the entire contents of the API DB to an OSM PBF. Used for backup and populating the Render DB.
    - Uses [osm_api-db-init.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/osm_api-db-init.sh)
7. [Reset and Populate Render DB](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/posm-deploy-full.sh#L20-L25).
    - Resets and populates the Render DB with fresh OSM PBF that has been exported from the API DB.
    - Uses [osm_api-db-init.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/osm_api-db-init.sh)
8. [Reset and Configure Tessera and Field Papers](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/posm-deploy-full.sh#L20-L25).
    - Updates the configs of Tessera and Field Papers to have reflect the OSM data and MBTiles that have been loaded.
    - Uses [osm_api-db-init.sh](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/osm_api-db-init.sh)

## OpenMapKit Field Papers Atlas Deployment

After a bit of experimentation, we have found that the typical area of a Field Paper Atlas is also an ideal bounds for OSM XML
and MBTiles to be sent to an OpenMapKit deployment. Therefore, we have a script that will take the bounds of an atlas
from a Field Paper and create an OpenMapKit deployment.

A deployment is written to `/opt/data/deployments/<field paper atlas slug>`.

A given deployment contains:

1. `manifest.json` containing the name, title, and description of the atlas.
2. Buildings OSM XML
3. POI OSM XML
4. POSM Carto MBTiles (Cut directly from Mapnik)
5. Extract of other AOI MBTiles

A given AOI may have MBTiles files, such as Satellite imagery. This file tends to be large. We cut an extract of that
MBTiles by the bounds of the Field Papers atlas.

This script will be run automatically when a field papers atlas is created ([#132](https://github.com/AmericanRedCross/posm/issues/132)).
For now, you can manually run this script as follows:

```sh
/opt/admin/posm-admin/scripts/omk-atlas.js -a <aoi directory> -u <field paper atlas map.geojson url>
```

For example:

```sh
/opt/admin/posm-admin/scripts/omk-atlas.js -a /opt/data/aoi/huaquillas -u http://posm.local/fp/atlases/3bun4nml.geojson
```

## Update Render DB

The OSM API database has the source OSM data that can be imported, edited, and submitted to OpenStreetMap.
The Render database contains data that is a derivative of what is found in the API DB. This is needed
for Mapnik to cut tiles in a timely fashion. We utilize [`osm2pgsql`](https://github.com/AmericanRedCross/posm-admin/blob/bab07d4fa047990c312b5a35cdd41121fe22b73d/scripts/gis_render-db-pbf2render.sh#L21-L31)
to do this conversion.

This action is done initially in `posm-deploy-full.sh`, and it is then re-run
at :00 and :30 of every hour as a [cron job](https://github.com/AmericanRedCross/posm-build/blob/b5d9f0f2b8ddaf4329fa5157a00c0048ef9c398f/kickstart/scripts/admin-deploy.sh#L72-L82).

You many also manually re-run the [update script](https://github.com/AmericanRedCross/posm-admin/blob/master/scripts/render-db-update.sh) as follows:

```sh
/opt/admin/posm-admin/scripts/render-db-update.sh
```

## Sandbox Mode

To be discussed. See [#144](https://github.com/AmericanRedCross/posm/issues/144).

## Changeset Replay Tool

Under construction.

https://github.com/mojodna/changeset-replay-tool

## Backup

Current backups are manual. See [#141](https://github.com/AmericanRedCross/posm/issues/141).

## Mapillary Backup

To be discussed. See [#147](https://github.com/AmericanRedCross/posm/issues/147).
