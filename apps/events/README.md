# Events

## Development

developer commands

```shell
turbo events#typecheck
turbo events#test
turbo events#build
turbo events#dev
turbo events#start
```

## Deployment

### Setup

Install **queenctl**

```shell
go install github.com/smartpricing/queen/clients/client-cli/cmd/queenctl@latest
# setup shell completion
source <(queenctl completion zsh)
```

Commands to setup `queenctl` contexts and switching

```shell
queenctl config set-context local --server http://localhost:6632
queenctl config set-context prod  --server https://queen.chinthagunta.com --token "$JWT"
queenctl config use-context prod
queenctl config get-contexts
```

Create `flow-log-events` queue if not exist

```shell
cd apps/events
# setup queue for local dev env
dotenv-run -v -- bun run src/setup.js
# setup queue for prod env
NODE_ENV=production dotenv-run -v -- bun run src/setup.js
```

### Run

```shell
# run
turbo events#dev
# produce sample data for testing
cd apps/events
dotenv-run -v -- bun src/producer.js
```

```shell
# to sync events from prod queen to local DB
cd apps/events
QUEEN_BASE_URL=https://queen.chinthagunta.com dotenv-run -v -- bun run src/index.js
# to gracefully stop, send SIGTERM to `PID`
kill -15 "$PID"
```

### Build

```shell
cd apps/events
# debug build
docker build --no-cache --progress=plain  --pull -t ghcr.io/xmlking/sumolab/events:latest .
# regular build
docker build --pull -t ghcr.io/xmlking/sumolab/events:latest .
```

Build for **multi-platform** and **push**

```shell
cd apps/events
docker buildx build \
--platform linux/arm64/v8,linux/amd64 \
-t ghcr.io/xmlking/sumolab/events:0.1.3 \
-t ghcr.io/xmlking/sumolab/events:latest \
--label "org.opencontainers.image.source=https://github.com/xmlking/sumolab" \
--push .
```

To pull from GHCR

```shell
docker pull ghcr.io/xmlking/sumolab/events:latest
```

### Run

```shell
# debug run
docker run --init -it --entrypoint sh ghcr.io/xmlking/sumolab/events:latest
# regular run
docker run --init -it ghcr.io/xmlking/sumolab/events:latest
```

via docker compose

```shell
docker compose up events
# produce sample data for testing
cd apps/events
dotenv-run -v -- bun src/producer.js
```

### Configuration

Environment variables for `clients`

```shell
# enable debug logs
export QUEEN_CLIENT_LOG=true
# Real-time system: Only new messages by default
export DEFAULT_SUBSCRIPTION_MODE="new"
# If QUEEN_ENCRYPTION_KEY is not set and a queue has encryptionEnabled: true, messages are stored as plaintext
export QUEEN_ENCRYPTION_KEY=your-long-secure-key
```

## Troubleshoot

in case `multi-platform` is not enabled in your local docker engine, run:

```shell
docker buildx create --name multiarch-builder --use
docker buildx inspect --bootstrap
```

Also make sure you're logged in to your container registry

```shell
echo GHCR_READ_WRITE_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```
