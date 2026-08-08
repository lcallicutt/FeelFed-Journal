// E2E: boot merge — remote journal + an offline-made local entry both survive.
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

  // Boot 1: journal created + uploaded.
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const deviceId = await page.evaluate(() => localStorage.getItem("feelfed:deviceId:v1"));
  const serverBefore = (await (await fetch(`${BASE}/api/entries?deviceId=${deviceId}`)).json())
    .entries.length;
  if (serverBefore === 0) throw new Error("initial upload failed");

  // Simulate an entry made while offline (in cache, unknown to the server).
  await page.evaluate(() => {
    const list = JSON.parse(localStorage.getItem("feelfed:entries:v1") || "[]");
    list.push({ id: "offline-e2e-1", kind: "energy", at: new Date().toISOString(), level: 3 });
    localStorage.setItem("feelfed:entries:v1", JSON.stringify(list));
  });

  // Boot 2: merge must keep both the server journal and the offline entry.
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const local = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("feelfed:entries:v1") || "[]"),
  );
  const hasOffline = local.some((e) => e.id === "offline-e2e-1");
  const server = (await (await fetch(`${BASE}/api/entries?deviceId=${deviceId}`)).json()).entries;
  const serverHasOffline = server.some((e) => e.id === "offline-e2e-1");
  console.log(
    `serverBefore=${serverBefore} localAfter=${local.length} serverAfter=${server.length} offlineLocal=${hasOffline} offlineServer=${serverHasOffline}`,
  );
  if (!hasOffline) throw new Error("offline entry lost from local cache");
  if (!serverHasOffline) throw new Error("offline entry not uploaded");
  if (local.length !== serverBefore + 1) throw new Error("remote entries lost in merge");
  console.log("PASS");
} finally {
  await browser.close();
}
