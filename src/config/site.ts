import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Lightbulb, UserCircle, MessageSquare, Briefcase, Library, Home, Users, Mail } from 'lucide-react';

export const siteConfig = {
  name: 'E Hub',
  description: 'E-Hub Inc. is Cameroon’s first AI-powered career development and job-matching platform for youth.',
};

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Career Assessment',
    href: '/career-assessment',
    icon: Lightbulb,
  },
  {
    title: 'Interview Prep',
    href: '/interview-prep',
    icon: MessageSquare,
  },
  {
    title: 'Profile & Resume',
    href: '/profile-resume',
    icon: UserCircle,
  },
  {
    title: 'Opportunities',
    href: '/opportunities',
    icon: Briefcase,
  },
  {
    title: 'Resources',
    href: '/resources',
    icon: Library,
  },
];

// Nav items for public landing pages (if needed in LandingLayout header)
export const landingNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/',
        icon: Home,
    },
    // {
    //     title: 'About Us',
    //     href: '/about', // Example, if you create an about page
    //     icon: Users, 
    // },
    // {
    //     title: 'Contact',
    //     href: '/contact', // Example
    //     icon: Mail, 
    // }
];
