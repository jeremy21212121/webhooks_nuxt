#!/bin/bash
# Script to pull, build and redeploy justtrivia.fun back end

set -e;
# exit on error

cd /opt/trivia-backend;

# nuke package lock. We could probably avoid this by running the same version of node in dev and prod. This server isnt current using nvm.
git checkout -- package-lock.json;
git pull;

# pull in latest submodules. requires --init flag on first run
# git submodule update --remote; # we don't current have any submodules in this repo

# we don't have nvm installed on this server so npm is located in /usr/bin
/usr/bin/npm install;

# /usr/bin/npm run build; # no build step for back end

# user needs to be added to sudoers. only allow the following command.
sudo systemctl restart trivia-backend.service;
exit 0;
