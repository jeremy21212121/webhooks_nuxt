#!/bin/bash
# $1 is the target project repository

# exit 1 on error
set -e;

# make sure directory exists
if [ ! -d "$1" ]; then
  # redirect echo to stderr so it is correctly handled by the calling node.js application
  echo "Can't get commit hash, directory doesn't exist" 1>&2;
	exit 1
fi

# change to correct directory
cd "$1"

# commit hash to stdout
git rev-parse HEAD;

exit 0;

