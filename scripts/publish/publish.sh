#!/bin/bash

# set -u -e -o pipefail

readonly thisDir=$(cd $(dirname $0); pwd)

cd $(dirname $0)/../..

DIST="$(pwd)/dist"

NEXT=false
for ARG in "$@"; do
  case "$ARG" in
    -next)
      NEXT=true
      ;;
  esac
done

VERSION=$(node -p "require('./package.json').version")
echo "Version ${VERSION}"

publishToMaster() {
  (cd ${DIST}/@ng-util; for p in `ls .`; do cd $p; npm publish; cd ..; done)
}

publishToNext() {
  (cd ${DIST}/@ng-util; for p in `ls .`; do cd $p; npm publish --tag next; cd ..; done)
}

syncNpmMirror() {
  (cd ${DIST}/@ng-util; for p in `ls .`; do curl -X PUT https://registry-direct.npmmirror.com/-/package/@ng-util/$p/syncs; done)
}

./scripts/ci/build.sh

if [[ ${NEXT} == true ]]; then
  publishToNext
else
  publishToMaster
fi
syncNpmMirror
