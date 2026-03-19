import { StrictMode, type ReactNode } from "react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StrictMode>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </StrictMode>
  );
}
