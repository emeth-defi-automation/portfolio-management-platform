#!/usr/bin/env bash
source .env.local && \
    ngrok http --domain=$NGROK_STATIC_DOMAIN http://localhost:4000 && \
deactivate