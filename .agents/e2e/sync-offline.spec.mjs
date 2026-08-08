// E2E: offline edit + deletion persisted across a reload must survive boot sync.
// Blocks /api/* while the mutations happen, then reloads with the network back.
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

  // Boot 1 (online): journal uploaded to server.
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const deviceId = await page.evaluate(() => localStorage.getItem("feelfed:deviceId:v1"));
  const server0 = (await (await fetch(`${BASE}/api/entries?deviceId=${deviceId}`)).json()).entries;
  if (server0.length === 0) throw new Error("initial upload failed");

  // Pick two synced entries: one to edit, one to delete.
  const editId = server0[0].id;
  const deleteId = server0[1].id;

  // Boot 2 with API blocked: make an edit and a delete through the real store.
  await ctx.route("**/api/**", (route) => route.abort());
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.evaluate(
    async ([editId, deleteId]) => {
      const { store } = await import("/feelfed-app/src/lib/store.ts");
      store.updateEntry(editId, { note: "offline edit survives" });
      store.removeEntry(deleteId);
    },
    [editId, deleteId],
  );
  await page.waitForTimeout(500);
  const pending = await page.evaluate(() => localStorage.getItem("feelfed:pendingSync:v1"));
  console.log("pending after offline mutations:", pending);

  // Boot 3 with network restored (fresh in-memory state = app restart).
  await ctx.unroute("**/api/**");
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  const local = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("feelfed:entries:v1") || "[]"),
  );
  const edited = local.find((e) => e.id === editId);
  const server = (await (await fetch(`${BASE}/api/entries?deviceId=${deviceId}`)).json()).entries;
  const serverEdited = server.find((e) => e.id === editId);
  const localDeleted = !local.some((e) => e.id === deleteId);
  const serverDeleted = !server.some((e) => e.id === deleteId);
  console.log({
    localNote: edited?.note,
    serverNote: serverEdited?.note,
    localDeleted,
    serverDeleted,
  });
  if (edited?.note !== "offline edit survives") throw new Error("offline edit lost locally");
  if (serverEdited?.note !== "offline edit survives") throw new Error("offline edit not pushed");
  if (!localDeleted) throw new Error("offline deletion resurrected locally");
  if (!serverDeleted) throw new Error("offline deletion not pushed");
  console.log("PASS");
} finally {
  await browser.close();
}
