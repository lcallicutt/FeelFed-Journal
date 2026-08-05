/* GENERATED FROM tokens.json -- DO NOT EDIT. Run scripts/build-tokens.mjs. */
// Portable design tokens (colors as hex). Web consumes the theme via
// src/index.css; mobile (Expo) and any other platform import this object so the
// whole product shares one source of truth.
export const tokens = {
  "color": {
    "light": {
      "background": "#FBF7F2",
      "foreground": "#1F4E49",
      "border": "#D8CEC4",
      "card": "#FFFFFF",
      "cardForeground": "#1F4E49",
      "popover": "#FFFFFF",
      "popoverForeground": "#1F4E49",
      "primary": "#3A8F88",
      "primaryForeground": "#FBF7F2",
      "secondary": "#1F4E49",
      "secondaryForeground": "#FBF7F2",
      "muted": "#EDE7DF",
      "mutedForeground": "#5C7A77",
      "accent": "#F0A576",
      "accentForeground": "#1F4E49",
      "destructive": "#C0392B",
      "destructiveForeground": "#FBF7F2",
      "input": "#D8CEC4",
      "ring": "#3A8F88",
      "chart1": "#5FA8C4",
      "chart2": "#3A8F88",
      "chart3": "#F0A576",
      "chart4": "#1F4E49",
      "chart5": "#D4845A",
      "sidebar": "#EDE7DF",
      "sidebarForeground": "#1F4E49",
      "sidebarBorder": "#D8CEC4",
      "sidebarPrimary": "#3A8F88",
      "sidebarPrimaryForeground": "#FBF7F2",
      "sidebarAccent": "#F0A576",
      "sidebarAccentForeground": "#1F4E49",
      "sidebarRing": "#3A8F88",
      "ringFullness": "#26706A",
      "ringEnergy": "#FF9E52",
      "ringHydration": "#3FA9D4",
      "water": "#3FB2CE"
    },
    "dark": {
      "background": "#0E2422",
      "foreground": "#FBF7F2",
      "border": "#244F4B",
      "card": "#152C2A",
      "cardForeground": "#FBF7F2",
      "popover": "#152C2A",
      "popoverForeground": "#FBF7F2",
      "primary": "#48ADA6",
      "primaryForeground": "#0E2422",
      "secondary": "#244F4B",
      "secondaryForeground": "#FBF7F2",
      "muted": "#1A3633",
      "mutedForeground": "#8BC0BC",
      "accent": "#CB7952",
      "accentForeground": "#FBF7F2",
      "destructive": "#9B2335",
      "destructiveForeground": "#FBF7F2",
      "input": "#244F4B",
      "ring": "#48ADA6",
      "chart1": "#5FA8C4",
      "chart2": "#48ADA6",
      "chart3": "#F0A576",
      "chart4": "#8BC0BC",
      "chart5": "#D4845A",
      "sidebar": "#0E2422",
      "sidebarForeground": "#FBF7F2",
      "sidebarBorder": "#244F4B",
      "sidebarPrimary": "#48ADA6",
      "sidebarPrimaryForeground": "#0E2422",
      "sidebarAccent": "#244F4B",
      "sidebarAccentForeground": "#FBF7F2",
      "sidebarRing": "#48ADA6",
      "ringFullness": "#48ADA6",
      "ringEnergy": "#FF9E52",
      "ringHydration": "#3FA9D4",
      "water": "#3FB2CE"
    }
  },
  "fontFamily": {
    "sans": [
      "Poppins",
      "sans-serif"
    ],
    "serif": [
      "Fraunces",
      "serif"
    ],
    "mono": [
      "Lato",
      "sans-serif"
    ]
  },
  "radius": "0.75rem",
  "spacing": "0.25rem"
} as const;

export type Tokens = typeof tokens;
export default tokens;
