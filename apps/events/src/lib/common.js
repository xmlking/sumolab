// ---------- Periodic counter logger ----------
export class CounterLogger {
  constructor(role, instance, intervalMs = 5000) {
    this.role = role;
    this.instance = instance;
    this.intervalMs = intervalMs;
    this.count = 0;
    this.lastCount = 0;
    this.lastTime = Date.now();
    this.timer = setInterval(() => this.tick(), intervalMs);
  }
  inc(n = 1) {
    this.count += n;
  }
  tick() {
    const now = Date.now();
    const dt = (now - this.lastTime) / 1000;
    const dc = this.count - this.lastCount;
    const rate = dt > 0 ? dc / dt : 0;
    process.stderr.write(
      `[${new Date().toISOString()}] [${this.role}-${this.instance}] processed=${this.count} rate=${rate.toFixed(0)}/s\n`
    );
    this.lastCount = this.count;
    this.lastTime = now;
  }
  stop() {
    clearInterval(this.timer);
    this.tick();
  }
}
