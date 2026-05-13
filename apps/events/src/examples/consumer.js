import { Queen } from "queen-mq";

const queen = new Queen({
  url: process.env.QUEEN_BASE_URL,
  bearerToken: process.env.QUEEN_TOKEN,
});

console.log("🚀 Starting consumer...");

// Consume messages with a consumer group
await queen
  .queue("my-second-queue")
  .group("my-consumer-group") // Consumer group for scalability
  .concurrency(5) // Process up to 5 messages in parallel
  .batch(10) // Fetch 10 messages at a time
  .autoAck(true) // Automatically acknowledge successful processing
  .each() // Process messages one by one
  .consume(async (message) => {
    console.log("📨 Processing:", message.data);

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("✅ Processed:", message.data);
  });

// The consumer will keep running...
