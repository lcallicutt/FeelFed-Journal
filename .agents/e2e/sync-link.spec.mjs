// E2E: second browser links a journal via sync code on the You page.
import { chromium } from "playwright-core";

const CHROMIUM = "/nix/store/5afrhwm7zqn1vb7p5z1mc2rkh2grsfgz-ungoogled-chromium-138.0.7204.100/bin/chromium";
const BASE = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const APP = `${BASE}/feelfed-app/`;

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  // Browser A: create journal + add a distinctive entry via store sync.
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  await pageA.goto(APP, { waitUntil: "networkidle" });
  await pageA.waitForTimeout(2000);
  const codeA = await pageA.evaluate(() => localStorage.getItem("feelfed:deviceId:v1"));
  const countA = await pageA.evaluate(
    () => JSON.parse(localStorage.getItem("feelfed:entries:v1") || "[]").length,
  );
  console.log("A code:", codeA, "entries:", countA);

  // Browser B (fresh context = second device): link with codeA.
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await pageB.goto(APP + "you", { waitUntil: "networkidle" });
  await pageB.waitForTimeout(2000);
  const codeB = await pageB.evaluate(() => localStorage.getItem("feelfed:deviceId:v1"));
  if (codeB === codeA) throw new Error("contexts unexpectedly shared storage");

  await pageB.fill('[data-testid="input-link-sync-code"]', codeA);
  await pageB.click('[data-testid="button-link-sync-code"]');
  await pageB.waitForTimeout(2500);

  const linkedCode = await pageB.evaluate(() => localStorage.getItem("feelfed:deviceId:v1"));
  const countB = await pageB.evaluate(
    () => JSON.parse(localStorage.getItem("feelfed:entries:v1") || "[]").length,
  );
  console.log("B linked code:", linkedCode, "entries:", countB);
  if (linkedCode !== codeA) throw new Error("deviceId not switched");
  if (countB !== countA) throw new Error(`expected ${countA} entries, got ${countB}`);
  console.log("PASS");
} finally {
  await browser.close();
}
