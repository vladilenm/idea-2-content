"use client";

import { LazyMotion, domAnimation } from "framer-motion";

// Грузим только DOM-фичи framer-motion (~50% от полного бандла motion).
// strict: запрещает использовать тяжёлый `motion.*` — только лёгкий `m.*`.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
