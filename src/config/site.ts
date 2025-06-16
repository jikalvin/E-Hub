import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Lightbulb, UserCircle, MessageSquare, Briefcase, Library, Home, Users, Mail } from 'lucide-react';

export const siteConfig = {
  name: 'E Hub',
  description: 'E-Hub Inc. is Cameroon\'s first AI-powered career development and job-matching platform for youth.',
};

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

// Student Navigation
export const studentNavItems: NavItem[] = [
  {
    title: 'Student Dashboard', // Renamed for clarity if needed, or keep as 'Dashboard'
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

// School Admin Navigation
export const schoolAdminNavItems: NavItem[] = [
  {
    title: 'School Dashboard',
    href: '/school-dashboard',
    icon: LayoutDashboard, // Placeholder, consider 'Users' or a building icon
  },
  {
    title: 'Internships', // Direct link to manage internships
    href: '/school-dashboard/internships', // Assuming a sub-route
    icon: Briefcase,
  },
  {
    title: 'Profile', // Generic profile link
    href: '/school-dashboard/profile', // Corrected path
    icon: UserCircle,
  },
];

// Employer Navigation
export const employerNavItems: NavItem[] = [
  {
    title: 'Employer Dashboard',
    href: '/employer-dashboard',
    icon: LayoutDashboard, // Placeholder, consider 'Building' or 'Briefcase'
  },
  {
    title: 'Job Postings', // Direct link to manage job postings
    href: '/employer-dashboard/jobs', // Assuming a sub-route
    icon: Briefcase,
  },
  {
    title: 'Profile', // Generic profile link
    href: '/employer-dashboard/profile', // Corrected path
    icon: UserCircle,
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
