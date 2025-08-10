"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"          // adds 'class="dark"' to <html>
      defaultTheme="system"      // system by default
      enableSystem
      disableTransitionOnChange  // no flash when toggling
    >
      {children}
    </NextThemesProvider>
  );
}
