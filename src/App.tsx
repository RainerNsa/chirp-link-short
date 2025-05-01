
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Urls from "./pages/Urls";
import NotFound from "./pages/NotFound";

// Import MSW worker directly
import { worker } from "./mocks/browser";

// Initialize MSW only in development
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: "bypass", // Don't warn about unhandled requests
  }).catch(error => {
    console.error("MSW worker registration failed:", error);
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Log that we're using MSW for mocking API calls
    if (import.meta.env.DEV) {
      console.log(
        "%cURL Shortener App is using Mock Service Worker to simulate API calls.",
        "color: #8b5cf6; font-weight: bold; font-size: 12px;"
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/urls" element={<Urls />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
