import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { ScrollToHashElement } from "./ScrollToHashElement";
import { AuthProvider } from "../helpers/useAuth";
import { switchToDarkMode, loadTheme } from "../helpers/themeMode";
import { GlobalLoadingProvider } from "../helpers/GlobalLoadingContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Initialize theme (Defaults to Dark, or loads user pref) immediately
if (typeof window !== "undefined") {
  loadTheme();
}

export const GlobalContextProviders = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToHashElement />
      <AuthProvider>
        <GlobalLoadingProvider>
          <TooltipProvider>
            {children}
            <SonnerToaster />
          </TooltipProvider>
        </GlobalLoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
