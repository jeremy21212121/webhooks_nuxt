#!/bin/bash
# Script to pull, build and redeploy waxshop.ca

set -e;
# exit on error

cd /opt/waxshop;
git checkout -- package-lock.json;
git pull;
npm install;
npm run build;
sudo systemctl restart nuxtwaxshop.service;
exit 0;
