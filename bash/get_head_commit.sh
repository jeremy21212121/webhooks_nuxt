#!/bin/bash

# exit 1 on error
set -e;

# change to correct directory or abort
if [[ $1 == "front" ]]; then
	cd /opt/just-trivia-nuxt
elif [[ $1 == "back" ]]; then
	cd /opt/trivia-backend
else
	exit 1
fi

# commit hash to stdout
git rev-parse HEAD;

exit 0;

