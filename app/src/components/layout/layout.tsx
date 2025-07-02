"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
        <div className="relative min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container py-6 md:py-10">
            {children}
          </main>
          <footer className="py-6 border-t">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                &copy; {new Date().getFullYear()} Filethetic - Decentralized Synthetic Data Platform
              </p>
              <p className="text-sm text-muted-foreground">
                Built with ❤️ on Filecoin with FilCDN & USDFC
              </p>
            </div>
          </footer>
        </div>
        <Toaster />
    </ThemeProvider>
  );
}
