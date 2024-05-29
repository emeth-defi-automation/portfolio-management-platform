#!/usr/bin/env bash
source .env.local && \
    ngrok http --domain=$NGROK_STATIC_DOMAIN https://localhost:5273 && \
deactivate