#!/bin/bash

# Node dirs
DIR=$(cd $( dirname "${BASH_SOURCE[0]}" ) && cd .. && pwd)
NODE_BIN=$DIR/node_modules/.bin/

IGNORE=(babel-preset-lingui-react babel-preset-lingui-js)

# Package dirs
PACKAGE=`pwd`
PACKAGE_NAME=$(basename $PACKAGE)
SRC_DIR=$PACKAGE/src/
DIST_DIR=$PACKAGE/lib/

[[ " ${IGNORE[*]} " == *" $PACKAGE_NAME "* ]] && exit 0

# Clean previous build
$NODE_BIN/rimraf $DIST_DIR
mkdir -p $DIST_DIR

CUSTOM_BUILD=$DIR/scripts/prepublish-$PACKAGE_NAME.sh

echo $CUSTOM_BUILD

if [ -x $CUSTOM_BUILD ]; then
    $CUSTOM_BUILD $SRC_DIR $DIST_DIR
else
    # Compile source using babel
    $NODE_BIN/rollup -c $DIR/rollup.config.js

    ## Copy source as type definitions
    find $SRC_DIR -type f -name '*.js' ! -name '*.test.js' -exec sh -c 'cp -f $0 ${0%.js}.js.flow' {} \;
    rsync -rv --include '*/' --include '*.js.flow' --exclude '*' --prune-empty-dirs $SRC_DIR $DIST_DIR
    find $SRC_DIR -type f -name '*.js.flow' -delete
fi

