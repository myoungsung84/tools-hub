#!/usr/bin/env bash
set -e

IMAGE_NAME=tools-hub
TAG=local
CONTAINER_NAME=tools-hub-local
PORT=3000
DOCKERFILE=docker/dockerfile

cmd=${1:-run}

build() {
  echo "▶ Docker build: $IMAGE_NAME:$TAG"
  docker build \
    --no-cache \
    -f $DOCKERFILE \
    -t $IMAGE_NAME:$TAG \
    .
  echo "✔ Build complete"
}

run() {
  build
  echo "▶ Run container: http://localhost:$PORT"
  docker run --rm \
    -p $PORT:3000 \
    --name $CONTAINER_NAME \
    $IMAGE_NAME:$TAG
}

stop() {
  echo "▶ Stop container: $CONTAINER_NAME"
  docker rm -f $CONTAINER_NAME 2>/dev/null || true
  echo "✔ Stopped"
}

shell() {
  echo "▶ Shell into image: $IMAGE_NAME:$TAG"
  docker run --rm -it \
    $IMAGE_NAME:$TAG \
    sh
}

case "$cmd" in
  build)
    build
    ;;
  run)
    run
    ;;
  stop)
    stop
    ;;
  shell)
    shell
    ;;
  *)
    echo "Usage: $0 {build|run|stop|shell}"
    exit 1
    ;;
esac
