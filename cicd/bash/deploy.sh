#!/usr/bin/env bash

CONTAINER_NAME=$1
IMAGE_NAME=$2
APP_ENV=$3

# log
echo "Starting container ${CONTAINER_NAME} based on the image ${IMAGE_NAME}"
echo "env: ${APP_ENV}"

# read local vars
echo "Sourcing vars..."
# shellcheck disable=SC1090
source ~/config/"${CONTAINER_NAME}"/vars

echo "Stop previous launched container"
docker stop "${CONTAINER_NAME}" > /dev/null
docker rm "${CONTAINER_NAME}" > /dev/null
docker pull "${IMAGE_NAME}"

echo "Starting the container..."
docker run -d --restart unless-stopped \
    --name="${CONTAINER_NAME}" \
    -p 15511:80 \
    "${IMAGE_NAME}"

echo "Container has been started"