import { useEffect, useLayoutEffect } from "react";
/** Preserve pre-paint browser measurements without a server-side layout-effect warning. */
export const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
