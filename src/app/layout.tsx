import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { cn } from '@/lib/utils';
// Removed Inter and Space_Grotesk imports from next/font as they are linked in <head>

export const metadata: Metadata = {
  title: 'E Hub - Your AI-Powered Career Development Hub',
  description: 'E-Hub Inc. is Cameroon’s first AI-powered career development and job-matching platform for youth.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          // CSS variables --font-inter and --font-space-grotesk are set in tailwind.config.ts if needed
          // or directly referenced in font-family definitions there.
        )}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
