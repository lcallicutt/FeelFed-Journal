---
name: JSX generic type arguments break vite react-babel
description: Avoid <Component<Type>> generic syntax in .tsx in this workspace's react-vite artifacts
---

Rule: don't use explicit JSX generic type arguments (`<ChoiceField<AmountEaten> ...>`) in react-vite artifacts here — the `@vitejs/plugin-react` Babel parser throws "Unexpected token" and the page 500s.

**Why:** hit this on the FeelFed app prototype first build (Aug 2026); every screen failed until the generics were stripped.

**How to apply:** rely on inference, or cast in the callback (`onChange={(v) => setX(v as T)}`) when inference widens to string.
