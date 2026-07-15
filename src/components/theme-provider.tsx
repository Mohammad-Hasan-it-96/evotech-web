"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import { themeInitScript } from "@/lib/theme";

/**
 * Injects the blocking theme script into the server-rendered HTML via
 * useServerInsertedHTML — this keeps the <script> out of the client React tree,
 * avoiding the React 19 / Next 16 "script tag while rendering" warning while still
 * setting the theme before first paint (no FOUC).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  ));

  return <>{children}</>;
}
