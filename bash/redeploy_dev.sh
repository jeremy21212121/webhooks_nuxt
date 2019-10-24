#!/bin/bash
# Script to pull, build and redeploy waxshop.ca

set -e;
# exit on error

cd /opt/waxshop;
git checkout -- package-lock.json;
git pull;
# pull in latest submodules. requires --init flag on first run
git submodule update --remote;
/home/ubuntu/.nvm/versions/node/v12.9.1/bin/npm install;
/home/ubuntu/.nvm/versions/node/v12.9.1/bin/npm run build;
sudo systemctl restart nuxtwaxshop.service;
exit 0;
