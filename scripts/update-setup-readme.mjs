import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = path.resolve("C:\\xampp\\htdocs\\e-commerce");
const setupDir = path.join(rootDir, "docs", "setup");
const readmePath = path.join(setupDir, "README.md");

const titleFromFile = (fileName) =>
  fileName
    .replace(/\.md$/i, "")
    .split(/[_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const descriptionMap = {
  firebase_setup: "Firebase auth and web app configuration steps.",
  tawk_setup: "Embedded Tawk.to live-chat widget setup steps.",
};

const run = async () => {
  const entries = await fs.readdir(setupDir, { withFileTypes: true });
  const guideFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md") && entry.name !== "README.md")
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const lines = [
    "# Setup Guides",
    "",
    "> This file is auto-generated. Do not edit it manually.",
    "",
    "This folder contains setup instructions for external services and project integrations.",
    "",
    "## Available Guides",
    "",
    ...guideFiles.flatMap((fileName) => {
      const slug = fileName.replace(/\.md$/i, "");
      const title = titleFromFile(fileName);
      const description = descriptionMap[slug] ?? "Project setup guide.";

      return [`- [${title}](./${fileName})`, `  ${description}`];
    }),
    "",
    "## Auto Update",
    "",
    "This index is regenerated automatically by `scripts/update-setup-readme.mjs` during `npm run dev`, `npm run build`, and `npm run lint`.",
    "",
    "For true live watching while you edit setup guides, run `npm run docs:watch`.",
    "",
  ];

  await fs.writeFile(readmePath, lines.join("\n"), "utf8");
};

run().catch((error) => {
  console.error("Failed to update setup README:", error);
  process.exitCode = 1;
});
