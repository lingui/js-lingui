#!/bin/bash

# Node dirs
DIR=$(cd $( dirname "${BASH_SOURCE[0]}" ) && cd .. && pwd)
NODE_BIN=$DIR/node_modules/.bin/

SRC_DIR=$1
DIST_DIR=$2

# Compile source using babel
$NODE_BIN/rollup -c $DIR/rollup.config.js
$NODE_BIN/rollup -c $DIR/rollup.config.js --module=dev

## Copy source as type definitions
find $SRC_DIR -type f -name '*.js' ! -name '*.test.js' -exec sh -c 'cp -f $0 ${0%.js}.js.flow' {} \;
rsync -rv --include '*/' --include '*.js.flow' --exclude '*' --prune-empty-dirs $SRC_DIR $DIST_DIR
find $SRC_DIR -type f -name '*.js.flow' -delete
