#!/bin/sh
set -e

cd "$(dirname "$0")"

git fetch origin main
git reset --hard origin/main

docker compose up -d --build --remove-orphans
docker compose run --rm --no-deps backend python -m scripts.import_category_images
docker image prune -f
