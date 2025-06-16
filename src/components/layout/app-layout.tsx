
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { siteConfig, mainNavItems } from '@/config/site';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Moon, Sun, LogOut, User, Settings, Loader2, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();

  let ThemeProviderComponent = SimpleThemeProvider;
  try {
    const { ThemeProvider } = require('next-themes');
    ThemeProviderComponent = ThemeProvider;
  } catch (e) {
    // next-themes not found
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); 
  };

  if (authLoading && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ThemeProviderComponent attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider defaultOpen>
        <Sidebar className="border-r">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Icons.Logo className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-headline font-semibold tracking-tight">
                {siteConfig.name}
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                      tooltip={{ children: item.title, className: 'font-body' }}
                      className="font-body"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
            <div className="flex flex-col gap-2 w-full">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start items-center gap-2 p-2 h-auto text-left group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0">
                      <Avatar className="h-7 w-7 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                        <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                       <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden overflow-hidden">
                        <span className="text-sm font-medium truncate max-w-[120px]">
                         {user.displayName || user.email?.split('@')[0]}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {user.email}
                        </span>
                       </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-56 mb-1 ml-1">
                    <DropdownMenuLabel className="truncate">{user.displayName || user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile-resume')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={() => window.open('/', '_blank')}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      <span>View Homepage</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <div className={cn("flex items-center justify-between group-data-[collapsible=icon]:justify-center", !user && "group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2")}>
                {typeof useTheme === 'function' && <ThemeToggle />}
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
             <div className="md:hidden">
               <SidebarTrigger />
             </div>
             <div className="flex-1 md:hidden" /> {/* Spacer for mobile trigger */}
             {/* Placeholder for breadcrumbs or additional header content. Currently empty for more space on mobile */}
             <div className="hidden md:flex items-center gap-2"> {/* Actions only for desktop */}
                {/* Any header actions can go here if needed */}
             </div>
          </header>
          <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProviderComponent>
  );
}
