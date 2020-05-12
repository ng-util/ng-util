#!/usr/bin/env bash

set -u -e -o pipefail

cd $(dirname $0)/../..

# monaco-editor
cp node_modules/monaco-editor/monaco.d.ts packages/monaco-editor
