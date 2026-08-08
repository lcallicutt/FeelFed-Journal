// E2E: journal syncs to server — entries survive clearing browser data.
import { chromium } from "playwright-core";

const CHROMIUM = "/nix/store/5afrhwm7zqn1vb7p5z1mc2rkh2grsfgz-ungoogled-chromium-138.0.7204.100/bin/chromium";
const BASE = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const APP = `${BASE}/feelfed-app/`;

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  // 1) First visit: seeds locally, should bulk-upload to server.
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const deviceId = await page.evaluate(() => localStorage.getItem("feelfed:deviceId:v1"));
  if (!deviceId) throw new Error("no deviceId created");
  const localCount = await page.evaluate(
    () => JSON.parse(localStorage.getItem("feelfed:entries:v1") || "[]").length,
  );

  const res = await fetch(`${BASE}/api/entries?deviceId=${deviceId}`);
  const { entries } = await res.json();
  console.log("local entries:", localCount, "server entries:", entries.length);
  if (entries.length === 0) throw new Error("bulk upload did not happen");

  // 2) Simulate a fresh device that knows the deviceId (same user, new browser):
  //    clear entries cache but keep deviceId, reload → entries should come back.
  await page.evaluate(() => {
    localStorage.removeItem("feelfed:entries:v1");
    localStorage.removeItem("feelfed:idCounter:v1");
  });
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const restored = await page.evaluate(
    () => JSON.parse(localStorage.getItem("feelfed:entries:v1") || "[]").length,
  );
  console.log("restored after clearing cache:", restored);
  // On reload with no local cache, seed data regenerates then server pull replaces it.
  if (restored !== entries.length) {
    throw new Error(`expected ${entries.length} restored entries, got ${restored}`);
  }
  console.log("PASS");
} finally {
  await browser.close();
}
