#!/usr/bin/env bash

set -euo pipefail

# Check if the CI environment variable exists - if not, set default value to `false`,
# if yes, check if it is set to `false`, which determines that we run script locally
# and we need to source environment variables.
if [ "${CI:-false}" = "false" ]; then
  # Get the directory of the current script.
  SCRIPT_DIR_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

  # Construct the path to the `.env.local` file by navigating up one directory.
  ENV_LOCAL_FILE_PATH="${SCRIPT_DIR_PATH}/../.env.local"

  # Check if the `.env.local` file exists.
  if [ ! -f "${ENV_LOCAL_FILE_PATH}" ]; then
      echo "Error: .env.local file does not exist at ${ENV_LOCAL_FILE_PATH} path."
      exit 1
  fi

  # Source the `.env.local` file in a way that supports non-exported variables.
  while IFS='=' read -r key value; do
    # Skip lines that are empty or start with a hash (comments).
    [[ -z $key || $key =~ ^# ]] && continue

    # Remove potential leading "export " in each line for file consistency.
    key=${key#export }

    # Use eval to correctly handle values with spaces.
    eval export "$key='$value'"

  # Do it through all lines in `.env.local` file.
  done < "${ENV_LOCAL_FILE_PATH}"
fi

# Find, pause and remove running old surrealdb container
if podman ps --format "{{.Names}}" | grep "surrealdb" &> /dev/null; then
  echo "Stopping old surrealdb container..."
  podman stop surrealdb &> /dev/null
  echo "Old surrealdb container stopped."
fi

podman run --rm --pull always \
  --name surrealdb \
  -p 8000:8000 \
  docker.io/surrealdb/surrealdb:latest \
  start --log trace --user "$SURREALDB_USER" --pass "$SURREALDB_PASS" memory
