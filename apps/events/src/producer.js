import { Queen } from "queen-mq";

const QUEUE_NAME = process.env.EVENTS_QUEUE_NAME ?? "flow-log-events";

const queen = new Queen({
  url: process.env.QUEEN_BASE_URL,
  bearerToken: process.env.QUEEN_TOKEN,
});
const organizationId = process.env.SHARED_ORGANIZATION_ID;
const devices = [
  {
    id: "071afb13-4a17-4f5e-ce49-3ba3dd0a142a",
    hostname: "Oneill",
    os: "macos",
  },
  { id: "083ce17d-d05d-417e-d587-c250eb00c2c0", hostname: "Rush", os: "macos" },
  {
    id: "08585809-93d8-417b-7549-a5e4a4e841c6",
    hostname: "Daniels",
    os: "win",
  },
  {
    id: "099cce4b-8062-4573-f3b7-6bc1291901e5",
    hostname: "Medine",
    os: "linux",
  },
  {
    id: "09dff613-f826-4d29-dcf9-2240826663fb",
    hostname: "Farris",
    os: "macos",
  },
];
const users = ["76940d5f-3e72-4c06-2dd3-d8d26f2e6c03"];
const policies = [
  "03416400-f809-4abf-7c75-8cdcda0cc545",
  "055471c9-72d9-4790-9200-6c1f622ea12a",
  "06354d92-d5bf-4cf8-bf49-4bd14c7e3b40",
];
const actions = [
  "block",
  "callout_inspection",
  "callout_terminating",
  "callout_unknown",
  "permit",
];
const directions = ["egress", "ingress"];
const apps = [
  "\\device\\harddiskvolume3\\programdata\\microsoft\\windows defender\\platform\\4.18.26020.6-0\\msmpeng.exe",
  "\\device\\harddiskvolume3\\program files\\google\\chrome\\application\\chrome.exe",
  "\\device\\harddiskvolume3\\windows\\system32\\svchost.exe",
  "\\device\\harddiskvolume3\\program files\\mozilla firefox\\firefox.exe",
  "\\device\\harddiskvolume3\\windows\\system32\\lsass.exe",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randIp = () =>
  `${rand([10, 172, 192])}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
const randTimestamp = () =>
  Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400);

console.log("🚀 Starting producer...");
console.log({
  QUEUE_NAME,
  QUEEN_BASE_URL: process.env.QUEEN_BASE_URL,
});

for (let i = 1; i <= 10; i++) {
  const device = rand(devices);
  await queen
    .queue(QUEUE_NAME)
    .partition(`device-${device.id}`)
    .buffer({ messageCount: 10, timeMillis: 1000 }) // Buffer up to 10 messages OR 1 second
    .push([
      {
        data: {
          time: randTimestamp(),

          organizationId,
          deviceId: device.id,
          userId: rand(users),
          policyId: rand(policies),

          hostname: device.hostname,
          remoteAddress: randIp(),
          application: rand(apps),

          action: rand(actions),
          direction: rand(directions),

          tmEnabled: rand([true, false]),
          metadata: { os: device.os },
        },
      },
    ]);

  console.log(`✅ Pushed message ${i}`);

  // Wait a bit between messages
  // await new Promise((resolve) => setTimeout(resolve, 200));
}
// Flush remaining buffered messages
await queen.flushAllBuffers();

console.log("✅ All messages pushed!");
process.exit(0);
