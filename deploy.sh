#!/bin/sh
set -e

cd "$(dirname "$0")"

git fetch origin main
git reset --hard origin/main

docker compose up -d --build --remove-orphans
docker image prune -f
