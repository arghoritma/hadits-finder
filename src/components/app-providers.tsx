'use client';

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export default function AppProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false} {...props}>
      {children}
    </NextThemesProvider>
  );
}
