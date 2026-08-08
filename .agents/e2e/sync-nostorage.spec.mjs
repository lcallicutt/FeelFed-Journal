// E2E: when localStorage is unavailable, independently initialized clients
// must NOT share a device id (no shared fallback journal).
import { chromium } from "playwright-core";

const CHROMIUM = "/nix/store/5afrhwm7zqn1vb7p5z1mc2rkh2grsfgz-ungoogled-chromium-138.0.7204.100/bin/chromium";
const BASE = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const APP = `${BASE}/feelfed-app/`;

const BREAK_STORAGE = `
  const broken = { get: () => { throw new Error("storage disabled"); } };
  const stub = new Proxy({}, {
    get() { throw new Error("storage disabled"); },
  });
  Object.defineProperty(window, "localStorage", { get() { throw new Error("storage disabled"); } });
`;

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function bootWithoutStorage() {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.addInitScript(BREAK_STORAGE);
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const id = await page.evaluate(async () => {
    const { getDeviceId } = await import("/feelfed-app/src/lib/api.ts");
    return getDeviceId();
  });
  return { ctx, id };
}

try {
  const a = await bootWithoutStorage();
  const b = await bootWithoutStorage();
  console.log("A:", a.id, "B:", b.id);
  if (!a.id || !b.id) throw new Error("no device id generated");
  if (a.id === b.id) throw new Error("clients share a fallback device id");
  if (a.id === "ephemeral-device" || b.id === "ephemeral-device")
    throw new Error("fixed fallback id still in use");
  const res = await fetch(`${BASE}/api/entries?deviceId=ephemeral-device`);
  const { entries } = await res.json();
  console.log("entries under old shared id:", entries.length);
  console.log("PASS");
  await a.ctx.close();
  await b.ctx.close();
} finally {
  await browser.close();
}
