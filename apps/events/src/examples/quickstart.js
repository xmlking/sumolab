import { Queen } from "queen-mq";

// Connect to Queen server
const queen = new Queen({
  url: process.env.QUEEN_BASE_URL,
  bearerToken: process.env.QUEEN_TOKEN,
});

// Create a queue with configuration
await queen
  .queue("my-first-queue")
  .config({
    leaseTime: 30, // 30 seconds to process each message
    retryLimit: 3, // Retry up to 3 times on failure
  })
  .create();

console.log("✅ Queue created!");

// Push a message
await queen.queue("my-first-queue").push([
  {
    data: { message: "Hello, Queen MQ!" },
  },
]);

console.log("✅ Message pushed!");

// Pop and process the message
const messages = await queen.queue("my-first-queue").pop();

console.log("✅ Message received:", messages[0].data);

// Acknowledge the message
await queen.ack(messages[0], true);

console.log("✅ Message acknowledged!");

process.exit(0);
