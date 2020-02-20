#!/bin/bash
# Script to roll back repo to a particular commit
# This is modified from deploy script

set -e;
# exit on error

cd /opt/trivia-backend;

# nuke package lock. If this changed, it might mess up our plans
git checkout -- package-lock.json;

# make sure first arg isn't empty, else exit with error code
[[ $1 == "" ]] && exit 1; 

# checkout our last known good commit
git checkout $1;

# pull in latest submodules. requires --init flag on first run
# git submodule update --remote; # we don't current have any submodules in this repo

# we don't have nvm installed on this server so npm is located in /usr/bin
/usr/bin/npm install;

# no build step on back end
# /usr/bin/npm run build;

# user needs to be added to sudoers. only allow the following command:
sudo systemctl restart trivia-backend.service;

exit 0;

