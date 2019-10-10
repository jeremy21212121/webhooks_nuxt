#!/bin/bash
# Script to pull, build and redeploy waxshop.ca

set -e;
# exit on error

cd /opt/waxshop;
git checkout -- package-lock.json;
git pull;
/home/ubuntu/.nvm/versions/node/v12.9.1/bin/npm install;
/home/ubuntu/.nvm/versions/node/v12.9.1/bin/npm run build;
sudo systemctl restart nuxtwaxshop.service;
exit 0;
