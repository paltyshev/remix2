#!/usr/bin/env bash

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "${SCRIPT}")
PROJECT_PATH=${SCRIPTPATH}/../..

if [ ! -f "${PROJECT_PATH}/provisioning/clone/.crystallize" ]; then
    echo "It does not seem to be a clean clone. Aborting."
    exit 1
fi

echo "Setup ${PROJECT_PATH}"

cp -r ${PROJECT_PATH}/provisioning/clone/code/.env.dist ${PROJECT_PATH}/application/.env.dist

#---

echo "Cleanup ${PROJECT_PATH}"

rm -rf ${PROJECT_PATH}/.github
rm -rf ${PROJECT_PATH}/.git
rm -rf ${PROJECT_PATH}/.vscode
rm -rf ${PROJECT_PATH}/.platform
rm ${PROJECT_PATH}/application/.platform.app.yaml
rm ${PROJECT_PATH}/provisioning/clone

#---

echo "Running command ${PROJECT_PATH}"
cd ${PROJECT_PATH}/application && cp .env.dist .env
cd ${PROJECT_PATH}/application && npm install



