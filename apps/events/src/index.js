import { sql } from "bun";
import { Queen } from "queen-mq";

import { db } from "./db";
import { CounterLogger } from "./lib/common.js";

const NODE_ENV = process.env.NODE_ENV || "development";
const INSTANCE = process.env.INSTANCE || "0";

const QUEEN_BASE_URL = process.env.QUEEN_BASE_URL || "http://localhost:6632";
const QUEEN_TOKEN = process.env.QUEEN_TOKEN;

const QUEUE_NAME = process.env.EVENTS_QUEUE_NAME || "flow-log-events";
const GROUP = process.env.EVENTS_QUEUE_CONSUMER_GROUP || `device-access-events-sync-${NODE_ENV}`;
const CONCURRENCY = parseInt(process.env.EVENTS_CONCURRENCY || "5", 10);
const MAX_PARTITIONS_PER_POP = parseInt(process.env.EVENTS_MAX_PARTITIONS_PER_POP || "10", 10); // claim up to N partitions per pop call.
const BATCH_SIZE = parseInt(process.env.EVENTS_BATCH_SIZE || "100", 10);
const RENEW_LEASE_DURATION = parseInt(process.env.EVENTS_RENEW_LEASE_DURATION || "5000", 10);
const SUBSCRIPTION_FROM = process.env.EVENTS_SUBSCRIPTION_FROM || "new"; // "all" or "new" or something like "2026-05-01T00:00:00Z"

const queen = new Queen({ url: QUEEN_BASE_URL, bearerToken: QUEEN_TOKEN });
const counter = new CounterLogger(GROUP, INSTANCE, 5000);

const abortController = new AbortController();
let stopping = false;

async function processBatch(messages) {
  const events = messages.map((m) => ({
    time: new Date(m.data.time * 1000),
    organization_id: m.data.organizationId,
    // organization_id: process.env.SHARED_ORGANIZATION_ID,
    // device_id: m.producerSub,
    device_id: m.data.deviceId || m.partition?.replace("device-", ""), // Extract device ID from partition key
    user_id: m.data.userId || null,
    policy_id: m.data.policyId || null,
    hostname: m.data.hostname || null,
    remote_address: m.data.remoteAddress || null,
    application: m.data.application,
    direction: m.data.direction,
    action: m.data.action,
    tm_enabled: m.data.tmEnabled || true,
    metadata: m.data.metadata || null,
  }));
  await db`INSERT INTO device_access_events ${sql(events)}`;
}

async function ackSuccess(messages, _result) {
  try {
    await queen.ack(messages, true, { group: GROUP });
  } catch (ackErr) {
    process.stderr.write(`[${GROUP}-${INSTANCE}] batch ack(true) failed: ${ackErr.message}\n`);
    return;
  }
  counter.inc(messages.length);
}

async function ackFailure(messages, err) {
  const size = Array.isArray(messages) ? messages.length : 1;
  process.stderr.write(`[${GROUP}-${INSTANCE}] batch error (size=${size}): ${err.message}\n`);
  try {
    await queen.ack(messages, false, { group: GROUP });
  } catch (ackErr) {
    process.stderr.write(`[${GROUP}-${INSTANCE}] batch nack failed: ${ackErr.message}\n`);
  }
}
async function main() {
  console.log(`🚀 Starting server...`);
  console.log({
    QUEEN_BASE_URL,
    QUEUE_NAME,
    GROUP,
    CONCURRENCY,
    BATCH_SIZE,
    MAX_PARTITIONS_PER_POP,
    RENEW_LEASE_DURATION,
    SUBSCRIPTION_FROM,
    PID: process.pid,
  });

  const shutdown = () => {
    console.log("Shutting down...");
    stopping = true;
    abortController.abort();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  try {
    await queen
      .queue(QUEUE_NAME)
      .group(GROUP)
      .concurrency(CONCURRENCY)
      .batch(BATCH_SIZE)
      .partitions(MAX_PARTITIONS_PER_POP)
      .renewLease(true, RENEW_LEASE_DURATION)
      .autoAck(false)
      .subscriptionFrom(SUBSCRIPTION_FROM)
      .consume(processBatch, { signal: abortController.signal })
      .onSuccess(ackSuccess)
      .onError(ackFailure);
  } catch (err) {
    if (!stopping) {
      process.stderr.write(`[${GROUP}-${INSTANCE}] consume error: ${err.stack || err.message}\n`);
    }
  } finally {
    counter.stop();
    process.stderr.write(`[${GROUP}-${INSTANCE}] done · processed=${counter.count}\n`);
  }
}

main().catch((e) => {
  process.stderr.write(`[${GROUP}-${INSTANCE}] fatal: ${e.stack || e.message}\n`);
  process.exit(1);
});
