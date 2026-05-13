import { Queen } from "queen-mq";

// Connect to Queen server
const queen = new Queen({
  url: process.env.QUEEN_BASE_URL,
  bearerToken: process.env.QUEEN_TOKEN,
});

// Queue with encryption
await queen
  .queue("sensitive-data")
  .config({
    encryptionEnabled: true,
    leaseTime: 300,
    retryLimit: 3,
  })
  .create();
console.log("✅ Queue created with encryptionEnabled=true");

// Push a message
await queen.queue("sensitive-data").push([
  {
    data: { message: "Hello, Queen MQ!" },
  },
]);

console.log("✅ Message pushed!");

// Pop and process the message
const messages = await queen.queue("sensitive-data").pop();

console.log("✅ Message received:", messages[0].data);

// Acknowledge the message
await queen.ack(messages[0], true);

console.log("✅ Message acknowledged!");

process.exit(0);
