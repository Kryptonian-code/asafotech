import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const rootDir = path.resolve("C:\\xampp\\htdocs\\e-commerce");
const setupDir = path.join(rootDir, "docs", "setup");
const generatorScript = path.join(rootDir, "scripts", "update-setup-readme.mjs");

let timeoutId;

const runGenerator = () => {
  const child = spawn(process.execPath, [generatorScript], {
    stdio: "inherit",
  });

  child.on("error", (error) => {
    console.error("Failed to regenerate setup README:", error);
  });
};

const scheduleUpdate = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    runGenerator();
  }, 150);
};

runGenerator();

const watcher = fs.watch(setupDir, (eventType, fileName) => {
  if (!fileName) {
    scheduleUpdate();
    return;
  }

  const normalized = String(fileName).toLowerCase();

  if (!normalized.endsWith(".md") || normalized === "readme.md") {
    return;
  }

  console.log(`[docs:watch] ${eventType}: ${fileName}`);
  scheduleUpdate();
});

console.log("[docs:watch] Watching docs/setup for setup guide changes...");

process.on("SIGINT", () => {
  watcher.close();
  clearTimeout(timeoutId);
  process.exit(0);
});
