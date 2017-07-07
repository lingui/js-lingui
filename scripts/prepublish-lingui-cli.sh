#!/bin/bash

# Node dirs
DIR=$(cd $( dirname "${BASH_SOURCE[0]}" ) && cd .. && pwd)
NODE_BIN=$DIR/node_modules/.bin/

SRC_DIR=$1
DIST_DIR=$2

$NODE_BIN/babel $SRC_DIR --out-dir $DIST_DIR --ignore *.test.js
