// E2E: rapid successive edits must not be reverted by an out-of-order PUT.
// The proxy delays the FIRST PUT /api/entries by 1.5s; with a serialized sync
// queue the second edit's PUT cannot overtake it, so the latest edit must be
// on the server and survive a reload.
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

  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const deviceId = await page.evaluate(() => localStorage.getItem("feelfed:deviceId:v1"));
  const server0 = (await (await fetch(`${BASE}/api/entries?deviceId=${deviceId}`)).json()).entries;
  if (server0.length === 0) throw new Error("initial upload failed");
  const editId = server0[0].id;

  // Delay only the first PUT so a naive implementation would reorder.
  let delayed = false;
  await ctx.route("**/api/entries", async (route) => {
    if (route.request().method() === "PUT" && !delayed) {
      delayed = true;
      await new Promise((r) => setTimeout(r, 1500));
    }
    await route.continue();
  });

  await page.evaluate(
    async ([editId]) => {
      const { store } = await import("/feelfed-app/src/lib/store.ts");
      store.updateEntry(editId, { note: "first edit" });
      store.updateEntry(editId, { note: "latest edit wins" });
    },
    [editId],
  );
  await page.waitForTimeout(4000);

  const server = (await (await fetch(`${BASE}/api/entries?deviceId=${deviceId}`)).json()).entries;
  const remoteNote = server.find((e) => e.id === editId)?.note;
  console.log("server note after racing edits:", remoteNote);
  if (remoteNote !== "latest edit wins") throw new Error("stale edit overwrote the latest one");

  // Reload (fresh boot sync) — latest edit must survive locally too.
  await ctx.unroute("**/api/entries");
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const localNote = await page.evaluate(
    ([editId]) =>
      JSON.parse(localStorage.getItem("feelfed:entries:v1") || "[]").find((e) => e.id === editId)
        ?.note,
    [editId],
  );
  console.log("local note after reload:", localNote);
  if (localNote !== "latest edit wins") throw new Error("latest edit lost after reload");
  console.log("PASS");
} finally {
  await browser.close();
}
