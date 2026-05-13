# sumolab

Secure homelab infrastructure with monitoring, container management, and security

Experimenting with [QueenMQ](https://queenmq.com/)

## Prerequisites

```shell
brew install node
# brew: bun, cog
brew install oven-sh/bun/bun cocogitto
# tools: turbo, dotenv cli
bun install turbo @dotenv-run/cli --global
```

## Setup

```shell
# install dependencies 
bun i
# format code
turbo check
turbo fix
```

## Development

```shell
docker compose up
```
