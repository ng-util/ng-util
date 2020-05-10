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
  (cd ${DIST}/@ng-util; for p in `ls .`; do npm publish --access public $p; done)
}

publishToNext() {
  (cd ${DIST}/@ng-util; for p in `ls .`; do npm publish $p --access public --tag next; done)
}

syncTaobao() {
  (cd ${DIST}/@ng-util; for p in `ls .`; do curl -X PUT https://npm.taobao.org/sync/@ng-util/$p?sync_upstream=true; done)
}

if [[ ${NEXT} == true ]]; then
  publishToNext
else
  publishToMaster
fi
syncTaobao
