import { Queen } from "queen-mq";

const queen = new Queen({
  url: process.env.QUEEN_BASE_URL,
  bearerToken: process.env.QUEEN_TOKEN,
});

const queueName = "flow-log-events";

// Create a queue with configuration

console.log(`🚀 Creating ${queueName} queue...`);
console.log({
  QUEUE_NAME: queueName,
  QUEEN_BASE_URL: process.env.QUEEN_BASE_URL,
});

await queen
  .queue(queueName)
  .config({
    leaseTime: 30, // 30 seconds to process each message
    retryLimit: 3, // Retry up to 3 times on failure
    deadLetterQueue: true, // Enable DLQ
    dlqAfterMaxRetries: true, // Auto-move to DLQ
    encryptionEnabled: false, // Encrypt messages at rest
    // Keep audit logs forever
    // retentionSeconds: 0                // Never delete pending (default)
    // completedRetentionSeconds: 0       //  Never delete completed
    // retentionSeconds: 86400,           // Keep pending for 24 hours
    // completedRetentionSeconds: 3600,   // Keep completed for 1 hour
    retentionSeconds: 604800, // Keep pending for 7 days
    completedRetentionSeconds: 86400, //  Keep completed for 1 day
  })
  .create();
