// Regression: editing an entry twice in a row never restores old values (Task 37)
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:80/feelfed-app/";
const CHROMIUM = "/nix/store/5afrhwm7zqn1vb7p5z1mc2rkh2grsfgz-ungoogled-chromium-138.0.7204.100/bin/chromium";

const fail = (msg) => { console.error("FAIL:", msg); process.exit(1); };
const ok = (msg) => console.log("PASS:", msg);

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await (await browser.newContext({ viewport: { width: 402, height: 874 } })).newPage();

async function setSlider(scope, label, target) {
  const slider = scope.locator(`[role="slider"][aria-label="${label}"]`);
  await slider.focus();
  for (let i = 0; i < 25; i++) {
    const cur = Number(await slider.getAttribute("aria-valuenow"));
    if (cur === target) return;
    await slider.press(cur < target ? "ArrowRight" : "ArrowLeft");
  }
  fail(`could not set slider ${label} to ${target}`);
}
const sliderVal = async (scope, label) =>
  Number(await scope.locator(`[role="slider"][aria-label="${label}"]`).getAttribute("aria-valuenow"));

// Edit-form sliders (Radix): aria-label sits on the root, thumb carries role=slider.
async function setFormSlider(scope, index, target) {
  const thumb = scope.locator('[role="slider"]').nth(index);
  await thumb.focus();
  for (let i = 0; i < 25; i++) {
    const cur = Number(await thumb.getAttribute("aria-valuenow"));
    if (cur === target) return;
    await thumb.press(cur < target ? "ArrowRight" : "ArrowLeft");
  }
  fail(`could not set form slider #${index} to ${target}`);
}
const formSliderVal = async (scope, index) =>
  Number(await scope.locator('[role="slider"]').nth(index).getAttribute("aria-valuenow"));

await page.goto(BASE, { waitUntil: "networkidle" });

// 1. Record a moment with known values.
const F0 = 4, E0 = 5, H0 = 6;
await setSlider(page, "fullness level", F0);
await setSlider(page, "energy level", E0);
await setSlider(page, "hydration level", H0);
await page.getByTestId("button-save-moment").click();
await page.getByText("Moment recorded").waitFor({ timeout: 5000 });
ok(`recorded moment F=${F0} E=${E0} H=${H0}`);

// 2. Open the newest Moment entry from Today's moments.
const countMomentRows = async () =>
  await page.locator('main >> text="Moment"').count();
const momentRowsBefore = await countMomentRows();

// Newest entry is rendered first in Today's moments list; click the row containing "Moment".
const momentRow = page.locator('button, [role="button"], li, div').filter({ hasText: /^Moment/ }).first();
// More robust: timeline entries — find element containing "Moment" text that is clickable
const row = page.getByText("Moment", { exact: true }).first();
await row.click();

const sheet = page.locator('[role="dialog"]');
await sheet.waitFor({ timeout: 5000 });

// Verify read view shows recorded values (dd next to dt labels).
async function readField(label) {
  const dt = sheet.locator("dt", { hasText: label }).first();
  const dd = dt.locator("xpath=following-sibling::dd");
  return (await dd.textContent())?.trim();
}
const f = await readField("Fullness"), e = await readField("Energy"), h = await readField("Hydration");
if (!f.startsWith(String(F0)) || !e.startsWith(String(E0)) || !h.startsWith(String(H0)))
  fail(`initial read view mismatch: F=${f} E=${e} H=${h}`);
ok("detail sheet shows recorded values");

// 3. Edit #1: change Fullness only.
const F1 = 9;
await sheet.getByTestId("button-edit-entry").click();
await setFormSlider(sheet, 0, F1); // moment form order: Fullness, Energy, Hydration
await sheet.getByTestId("button-save-edit").click();
await page.getByText("Entry updated").first().waitFor({ timeout: 5000 });
if ((await readField("Fullness")) !== `${F1}/10`.replace("/10","/10") && !(await readField("Fullness")).startsWith(String(F1)))
  fail("edit 1: fullness not updated");
ok(`edit 1 saved: Fullness=${F1}`);

// 4. Edit #2: change Energy only. Fullness must stay F1.
const E1 = 8;
await sheet.getByTestId("button-edit-entry").click();
const fInForm = await formSliderVal(sheet, 0);
if (fInForm !== F1) fail(`edit form reopened with stale Fullness=${fInForm}, expected ${F1}`);
ok("edit form re-initialized from current store values");
await setFormSlider(sheet, 1, E1);
await sheet.getByTestId("button-save-edit").click();
await page.waitForTimeout(400);

// 5. KEY ASSERTION.
const f2 = await readField("Fullness"), e2 = await readField("Energy"), h2 = await readField("Hydration");
if (!f2.startsWith(String(F1))) fail(`REGRESSION: second edit reverted Fullness to ${f2}, expected ${F1}`);
if (!e2.startsWith(String(E1))) fail(`Energy not updated: ${e2}`);
if (!h2.startsWith(String(H0))) fail(`Hydration changed unexpectedly: ${h2}`);
ok(`after second edit: Fullness=${f2} Energy=${e2} Hydration=${h2} (first edit preserved)`);

// 6. Close sheet, verify no duplicate row in Today.
await sheet.getByRole("button", { name: "Close" }).click();
await sheet.waitFor({ state: "hidden", timeout: 5000 });
const momentRowsAfter = await countMomentRows();
if (momentRowsAfter !== momentRowsBefore) fail(`duplicate rows in Today: ${momentRowsBefore} -> ${momentRowsAfter}`);
ok(`Today still shows ${momentRowsAfter} Moment row(s) — no duplicates`);

// 7. History: exactly one new Moment today with edited values.
await page.getByTestId("link-tab-history").click();
await page.waitForTimeout(500);
const todaySection = page.locator(`[data-testid="section-day-${new Date().toDateString()}"]`);
await todaySection.waitFor({ timeout: 5000 });
const historyMoments = await todaySection.locator('text="Moment"').count();
console.log(`History today has ${historyMoments} Moment row(s)`);
if (historyMoments !== momentRowsAfter) fail(`History moment count (${historyMoments}) differs from Today (${momentRowsAfter}) — possible duplicate`);
// Open newest moment in history and check values persisted.
await todaySection.getByText("Moment", { exact: true }).first().click();
const sheet2 = page.locator('[role="dialog"]');
await sheet2.waitFor({ timeout: 5000 });
const fh = await readField("Fullness"), eh = await readField("Energy");
if (!fh.startsWith(String(F1)) || !eh.startsWith(String(E1))) fail(`History entry values wrong: F=${fh} E=${eh}`);
ok(`History entry shows Fullness=${fh} Energy=${eh}`);

console.log("ALL CHECKS PASSED");
await browser.close();
