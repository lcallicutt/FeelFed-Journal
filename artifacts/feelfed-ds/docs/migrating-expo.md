# Migrating Expo UI to FeelFed Design System

> **Important:** This package is **web-only**. There are no native theme hooks, native
> font hooks, or native components in `@workspace/feelfed-ds`. Do not attempt to
> replace Expo-local implementations with non-existent package imports — the module
> resolution will fail.

Read `artifacts/feelfed-ds/docs/AGENTS.md` and
`artifacts/feelfed-ds/docs/consuming-expo.md` before using this guide.

## What "migration" means for Expo

For Expo apps, migration means **replacing hardcoded color/font values** with the
portable token object, not replacing local native implementations with package
components. The Expo app keeps its own native theme, font loading, and component
library — it just synchronizes those values against `tokens`.

## Step 1 — Replace hardcoded palette values with token imports

Grep for any hardcoded hex values that duplicate the FeelFed palette in the Expo
artifact (`#3A8F88`, `#1F4E49`, `#FBF7F2`, `#F0A576`, `#5FA8C4`).

Replace each one with a reference to the token:

```tsx
// Before
const primary = "#3A8F88";

// After
import { tokens } from "@workspace/feelfed-ds/tokens";
const primary = tokens.color.light.primary; // "#3A8F88"
```

Map every color role you use to its `tokens.color.light.*` or `tokens.color.dark.*`
counterpart. Do not keep parallel hardcoded values.

## Step 2 — Replace hardcoded font family strings

Grep for hardcoded font family strings (`"Fraunces"`, `"Poppins"`, `"Lato"`) in the
Expo artifact. Replace them with the token values:

```tsx
import { tokens } from "@workspace/feelfed-ds/tokens";

// tokens.fontFamily.serif[0]  => "Fraunces"  (display)
// tokens.fontFamily.sans[0]   => "Poppins"   (labels)
// tokens.fontFamily.mono[0]   => "Lato"      (body)
```

Keep the existing `useFonts` / `@expo-google-fonts/*` loading intact — just
reference the family names through tokens rather than bare strings.

## Step 3 — Replace hardcoded radius and spacing

```tsx
import { tokens } from "@workspace/feelfed-ds/tokens";

// tokens.radius.base => "0.75rem" — convert to pixels as needed
const baseRadius = parseFloat(tokens.radius.base) * 16; // 12px
```

## Verify

After migration:
1. `@workspace/feelfed-ds/tokens` resolves correctly.
2. The app's native theme renders the FeelFed palette visually.
3. No FeelFed hex values remain hardcoded in the Expo artifact.
4. Run the Expo typecheck and dev workflow to confirm.

Migration is complete when every FeelFed color, font family, and spacing/radius
value the Expo app uses comes from the token object rather than being duplicated.
