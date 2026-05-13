import { Queen } from "queen-mq";

const queen = new Queen({
  url: process.env.QUEEN_BASE_URL,
  bearerToken: process.env.QUEEN_TOKEN,
});

console.log("🚀 Starting producer...");

// Push 20 messages
for (let i = 1; i <= 20; i++) {
  await queen
    .queue("my-second-queue")
    .push([{ data: { message: `Message ${i}`, timestamp: new Date() } }]);

  console.log(`✅ Pushed message ${i}`);

  // Wait a bit between messages
  await new Promise((resolve) => setTimeout(resolve, 200));
}

console.log("✅ All messages pushed!");
process.exit(0);
