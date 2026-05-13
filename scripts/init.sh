#!/bin/sh

# In repository root
cd "$(dirname $0)/.."

###------Root--------###

FILE=.env
if [[ -f "$FILE" || -n "$CI" ]]; then
    echo "'$FILE' exists."
else
	cp -n .env.example .env && echo 'Generated: .env, FIXIT'
fi

