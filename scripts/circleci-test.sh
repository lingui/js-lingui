#!/usr/bin/env bash

case $CIRCLE_NODE_INDEX in 0) NODE_VERSION=4 ;; 1) NODE_VERSION=5 ;; 2) NODE_VERSION=6 ;; esac

nvm install $NODE_VERSION
nvm alias default $NODE_VERSION

yarn test
status=$?

if [[ -e junitresults.xml ]]; then cp junitresults.xml $CIRCLE_TEST_REPORTS/test-results.xml; fi

nvm alias default 6.1.0

exit $status
