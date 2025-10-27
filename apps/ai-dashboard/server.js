import express from "express";
import fs from "fs";
import os from "os";
import { execSync } from "child_process";

const app = express();
const PORT = 9030;
const HEALTH_FILE = "/opt/sprosi-vracha-ai/logs/ai-health.json";
const LOG_DIR = "/opt/sprosi-vracha-ai/apps";

function readHealth() {
  try {
    const data = fs.readFileSync(HEALTH_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function collectLogs() {
  const logs = {};
  const services = ["ops-autofix", "ai-recovery", "ai-upgrade", "ai-maintenance"];
  for (const name of services) {
    const path = `${LOG_DIR}/${name}/logs/${name}.log` || `${LOG_DIR}/${name}/${name}.log`;
    try {
      const tail = execSync(`tail -n 5 ${path}`).toString();
      logs[name] = tail.trim().split("\n");
    } catch {
      logs[name] = [];
    }
  }
  return logs;
}

app.get("/api/health", (_, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    cpuLoad: os.loadavg()[0].toFixed(2),
    ramUsed: (100 - (os.freemem() / os.totalmem()) * 100).toFixed(1),
    processes: readHealth(),
    logs: collectLogs(),
  });
});

app.listen(PORT, () => {
  console.log(`✅ AI-Dashboard API запущен на порту ${PORT}`);
});
