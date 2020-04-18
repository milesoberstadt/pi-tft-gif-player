#!/bin/bash
# This lets us use relative paths
CWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CWD

ts-node src/process-latest-tweet.ts