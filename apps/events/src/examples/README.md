# Queen MQ

## Setup

```shell
cd apps/console
export QUEEN_BASE_URL=http://localhost:6632

# or for local development with traefik
cd apps/console
export NODE_TLS_REJECT_UNAUTHORIZED=0
export QUEEN_BASE_URL=https://queen-127-0-0-1.nip.io
export QUEEN_TOKEN="...JWT token you got by exchanging APIKey from BetterAuth server"

# or for prod
export QUEEN_BASE_URL=https://queen.chinthagunta.com
export QUEEN_TOKEN="...JWT token you got by exchanging APIKey from BetterAuth server"
```

## Examples

```shell
# optionally enable client side debug logs
export QUEEN_CLIENT_LOG=true
bun run src/queen/examples/quickstart.js

# Try Consumer Groups

bun run src/queen/examples/consumer.js
# in new terminal, run producer
bun run src/queen/examples/producer.js

# encryption test
bun run src/queen/examples/encryption.js

# transitions
bun run src/queen/examples/base.js
```
