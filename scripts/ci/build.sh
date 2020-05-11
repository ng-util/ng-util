#!/usr/bin/env bash
#!/usr/bin/env node --max-old-space-size=4096

set -u -e -o pipefail

cd $(dirname $0)/../..

DEBUG=false
PACKAGES=(lazy
  monaco-editor)
NODE_PACKAGES=(cli)

for ARG in "$@"; do
  case "$ARG" in
    -n)
      PACKAGES=($2)
      ;;
    -debug)
      DEBUG=true
      ;;
  esac
done

containsElement () {
  local e
  for e in "${@:2}"; do [[ "$e" == "$1" ]] && return 0; done
  return 1
}

updateVersionReferences() {
  NPM_DIR="$1"
  (
    echo "======    VERSION: Updating version references in ${NPM_DIR}"
    cd ${NPM_DIR}
    perl -p -i -e "s/PEER\-0\.0\.0\-PLACEHOLDER/^${VERSION}/g" $(grep -ril PEER\-0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
    perl -p -i -e "s/0\.0\.0\-PLACEHOLDER/${VERSION}/g" $(grep -ril 0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
  )
}

addBanners() {
  for file in ${1}/*; do
    if [[ -f ${file} && "${file##*.}" != "map" ]]; then
      cat ${LICENSE_BANNER} > ${file}.tmp
      cat ${file} >> ${file}.tmp
      mv ${file}.tmp ${file}
    fi
  done
}

VERSION=$(node -p "require('./package.json').version")
echo "=====BUILDING: Version ${VERSION}"

N="
"
PWD=`pwd`

SOURCE=${PWD}/packages
DIST=${PWD}/dist/@ng-util

# fix linux
# npm rebuild node-sass

build() {
  for NAME in ${PACKAGES[@]}
  do
    echo "====== PACKAGING ${NAME}"

    LICENSE_BANNER=${SOURCE}/license-banner.txt

    if ! containsElement "${NAME}" "${NODE_PACKAGES[@]}"; then
      # packaging
      node --max_old_space_size=4096 ${PWD}/scripts/build/packing ${NAME}
      # license banner
      addBanners ${DIST}/${NAME}/bundles
      # license file
      cp ${PWD}/LICENSE ${DIST}/${NAME}/LICENSE
      # package version
      updateVersionReferences ${DIST}/${NAME}
    else
      echo "not yet!!!"
    fi

  done
}

build

echo 'FINISHED!'

# TODO: just only cipchk
# clear | bash ./scripts/ci/build.sh -debug
# clear | bash ./scripts/ci/build.sh -n lazy -debug
if [[ ${DEBUG} == true ]]; then
  cd ../../
  DEBUG_FROM=${PWD}/work/delon/dist/@delon/*
  DEBUG_TO=${PWD}/work/ng-alain-themes/node_modules/@delon/
  echo "DEBUG_FROM:${DEBUG_FROM}"
  echo "DEBUG_TO:${DEBUG_TO}"
  rm -rf ${DEBUG_TO}
  mkdir -p ${DEBUG_TO}
  rsync -a ${DEBUG_FROM} ${DEBUG_TO}
  echo "DEBUG FINISHED~!"
fi
