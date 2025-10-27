import fs from "fs";
import { execSync } from "child_process";

const OUTPUT_FILE = "/opt/sprosi-vracha-ai/monitor/health.json";
const LOG_FILE = "/opt/sprosi-vracha-ai/apps/ai-healthcheck/ai-healthcheck.log";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim();
  } catch {
    return null;
  }
}

function getTimers() {
  const out = run("systemctl list-timers --no-pager --all --no-legend | grep ai-") || "";
  return out
    .split("\n")
    .filter(Boolean)
    .map(line => line.replace(/\s+/g, " ").split(" ")[-1])
    .length;
}

function checkService(name) {
  const status = run(`systemctl is-active ${name}`);
  return status === "active";
}

function checkUrl(url) {
  const result = run(`curl -s -o /dev/null -w "%{http_code}" ${url}`);
  return result === "200";
}

function collectHealth() {
  const modules = [
    "ai-content-pipeline",
    "ai-auto-publisher",
    "ai-content-orchestrator",
    "ai-trend-mapper",
    "ai-error-watcher"
  ];

  const data = {
    timestamp: new Date().toISOString(),
    server: run("hostname"),
    memory: run("free -h | grep Mem | awk '{print $3\"/\"$2}'"),
    disk: run("df -h / | tail -1 | awk '{print $3\"/\"$2}'"),
    timers_active: run("systemctl list-timers | grep ai- | wc -l"),
    modules: {},
    site_ok: checkUrl("https://sprosi-vracha.com/health")
  };

  for (const m of modules) {
    data.modules[m] = checkService(`${m}.service`);
  }

  fs.mkdirSync("/opt/sprosi-vracha-ai/monitor", { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  log("✅ HealthCheck завершён, результат обновлён");
}

log("🩺 Запуск AI-HealthCheck...");
collectHealth();
