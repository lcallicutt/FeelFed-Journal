# Consuming FeelFed Design System in Expo apps

> **Note:** The FeelFed Design System is currently a **web-only package**. It ships
> a full shadcn/Tailwind component library and DTCG token set for web (React/Vite)
> consumers. There is **no native surface** — no `native-theme`, no `use-colors`
> hook, no `use-fonts` hook, and no `src/components/native/` directory. Attempting
> to import those paths from this package will fail.

## What Expo apps can consume today

The portable hex token object is the only cross-platform export:

```tsx
import { tokens } from "@workspace/feelfed-ds";
// or
import { tokens } from "@workspace/feelfed-ds/tokens";
```

This gives you the raw hex values for all color roles in both light and dark mode,
the font family names, and the base radius/spacing values — everything you need to
wire up a native theme manually.

### Example: building a local native theme from tokens

```tsx
// In your Expo app's theme/colors.ts
import { tokens } from "@workspace/feelfed-ds/tokens";

export const Colors = {
  light: {
    background: tokens.color.light.background,   // "#FBF7F2"
    foreground: tokens.color.light.foreground,   // "#1F4E49"
    primary: tokens.color.light.primary,          // "#3A8F88"
    accent: tokens.color.light.accent,            // "#F0A576"
    // ... map all roles you use
  },
  dark: {
    background: tokens.color.dark.background,
    foreground: tokens.color.dark.foreground,
    primary: tokens.color.dark.primary,
    accent: tokens.color.dark.accent,
  },
};
```

### Example: loading FeelFed fonts in Expo

The font families are available as Google Fonts via `@expo-google-fonts/*`:

```tsx
import { useFonts } from "expo-font";
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import {
  Lato_400Regular,
  Lato_700Bold,
} from "@expo-google-fonts/lato";

export function useFeelFedFonts() {
  return useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Lato_400Regular,
    Lato_700Bold,
  });
}
```

## Rules

- Import only `@workspace/feelfed-ds` (tokens). All other paths are web-only.
- Build native theme, hooks, and components locally in the Expo artifact.
- Keep token values in sync: don't hardcode hex — always read from `tokens`.
- Match the web palette exactly so the two surfaces look like one product.
