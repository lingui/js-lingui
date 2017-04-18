#!/bin/bash

# Node dirs
DIR=$(cd $( dirname "${BASH_SOURCE[0]}" ) && cd .. && pwd)
NODE_BIN=$DIR/node_modules/.bin/

# Package dirs
PACKAGE=`pwd`
SRC_DIR=$PACKAGE/src/
DIST_DIR=$PACKAGE/lib/

# Clean previous build
$NODE_BIN/rimraf $DIST_DIR
mkdir -p $DIST_DIR

# Compile source using babel
$NODE_BIN/babel $SRC_DIR --out-dir $DIST_DIR --ignore *.test.js

# Copy source as type definitions
find $SRC_DIR -type f -name '*.js' ! -name '*.test.js' -exec sh -c 'cp -f $0 ${0%.js}.js.flow' {} \;
rsync -rv --include '*/' --include '*.js.flow' --exclude '*' --prune-empty-dirs $SRC_DIR $DIST_DIR
find $SRC_DIR -type f -name '*.js.flow' -delete
