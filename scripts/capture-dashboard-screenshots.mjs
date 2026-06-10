import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const screenshotDir = path.join(repoRoot, "screenshots");
const port = Number(process.env.DASHBOARD_PORT || 5173);
const basePath = "/SETS-tablet-app-New/";
const dashboardUrl =
  process.env.DASHBOARD_URL || `http://127.0.0.1:${port}${basePath}`;

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "phone", width: 390, height: 844 },
];

function canReach(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });
    request.on("error", () => resolve(false));
    request.setTimeout(1500, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await canReach(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for local dashboard at ${url}`);
}

async function startServerIfNeeded() {
  if (await canReach(dashboardUrl)) return null;

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const server = spawn(
    npmCommand,
    ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: repoRoot,
      env: { ...process.env, BROWSER: "none" },
      stdio: "inherit",
      shell: false,
    },
  );

  server.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.error(`Vite server exited with code ${code}`);
    }
  });

  await waitForServer(dashboardUrl);
  return server;
}

async function waitForAerialImage(page) {
  const image = page.getByAltText(
    "Aerial SETS yard overview — click to open the detailed yard map",
  );
  await image.waitFor({ state: "visible", timeout: 15000 });
  await image.evaluate((element) => {
    if (element.complete && element.naturalWidth > 0) return true;
    return new Promise((resolve, reject) => {
      element.addEventListener("load", () => resolve(true), { once: true });
      element.addEventListener(
        "error",
        () => reject(new Error("Aerial map image failed to load")),
        { once: true },
      );
    });
  });
}

async function captureDashboard() {
  await mkdir(screenshotDir, { recursive: true });
  const server = await startServerIfNeeded();
  const browser = await chromium.launch();

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      });
      await page.goto(dashboardUrl, { waitUntil: "networkidle" });
      await page
        .getByRole("heading", { name: "SETS Yard Control" })
        .waitFor({ state: "visible", timeout: 15000 });
      await waitForAerialImage(page);

      await page.screenshot({
        path: path.join(
          screenshotDir,
          `live-yard-dashboard-${viewport.name}.png`,
        ),
        fullPage: true,
      });

      await page
        .getByRole("button", { name: "Open yard map detail view" })
        .click();
      await page
        .getByTestId("actual-aerial-yard-map")
        .waitFor({ state: "visible", timeout: 15000 });

      await page.screenshot({
        path: path.join(
          screenshotDir,
          `yard-map-detail-${viewport.name}.png`,
        ),
        fullPage: true,
      });
      await page.close();
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }

  for (const viewport of viewports) {
    console.log(
      path.relative(
        repoRoot,
        path.join(screenshotDir, `live-yard-dashboard-${viewport.name}.png`),
      ),
    );
  }
}

captureDashboard().catch((error) => {
  console.error(error);
  process.exit(1);
});
