#!/bin/bash
# Script to pull, build and redeploy waxshop.ca

set -e;
# exit on error

cd /opt/waxshop-prod;
git pull;
npm install;
npm run build;
sudo systemctl restart nuxtwaxshop-prod.service;
exit 0;
