'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogIn, LayoutDashboard, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme ? useTheme() : { setTheme: () => {}, theme: 'light' };
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted || !useTheme) {
    return <div style={{width: '2.25rem', height: '2.25rem'}} />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

const SimpleThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};


export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();

  let ThemeProviderComponent = SimpleThemeProvider;
  try {
    const { ThemeProvider } = require('next-themes');
    ThemeProviderComponent = ThemeProvider;
  } catch (e) {
    // next-themes not found
  }

  return (
    <ThemeProviderComponent attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Icons.Logo className="h-8 w-8 text-primary" />
              <span className="font-headline text-xl font-semibold tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-4">
               <ThemeToggle />
              {authLoading ? (
                <Button variant="outline" disabled size="icon" className="w-10 h-10 sm:w-auto sm:px-4">
                    <Loader2 className="h-4 w-4 animate-spin sm:mr-0" />
                    <span className="hidden sm:inline">Loading...</span>
                </Button>
              ) : user ? (
                <Button asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-0 h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Go to Dashboard</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="default">
                  <Link href="/login">
                    <LogIn className="mr-0 h-4 w-4 sm:mr-2" />
                     <span className="hidden sm:inline">Login / Sign Up</span>
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="py-8 md:py-0 bg-muted border-t">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {/* <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary">Terms of Service</Link> */}
            </div>
          </div>
        </footer>
      </div>
    </ThemeProviderComponent>
  );
}
