import { Briefcase, Lightbulb, Award } from 'lucide-react';

export type IconName = 'lightbulb' | 'briefcase' | 'award';

export const homeFeatures = [
  {
    title: 'AI-Powered Career Guidance',
    description: 'Navigate your career path with personalized assessments and AI-driven interview preparation.',
    icon: 'lightbulb' as IconName,
    href: '/signup', 
  },
  {
    title: 'Dynamic Resume Building',
    description: 'Craft a compelling, professional resume that stands out to employers in Cameroon.',
    icon: 'briefcase' as IconName,
    href: '/signup',
  },
  {
    title: 'Exclusive Opportunities',
    description: 'Access a curated list of jobs, internships, and skill-building resources tailored for Cameroonian youth.',
    icon: 'award' as IconName,
    href: '/signup',
  },
];

export const teamMembers = [
  {
    name: 'Dr. Aline Nomo',
    role: 'Founder & CEO',
    bio: 'Visionary leader with a passion for youth empowerment and AI innovation in Africa.',
    image: '/images/team/aline-nomo.jpg', // We'll need to add these images to the public directory
    imageHint: 'woman portrait professional',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Jean-Paul Bikoro',
    role: 'Chief Technology Officer',
    bio: 'Expert in AI development and platform architecture, driving our technological advancement.',
    image: '/images/team/jean-paul-bikoro.jpg',
    imageHint: 'man portrait tech',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Fatima Diallo',
    role: 'Head of Partnerships',
    bio: 'Strategic connector building bridges with employers and educational institutions across Cameroon.',
    image: '/images/team/fatima-diallo.jpg',
    imageHint: 'woman smiling business',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Samuel Eto\'o Fils (Jr.)',
    role: 'Youth Ambassador',
    bio: 'Inspiring young Cameroonians to reach for their dreams through dedication and hard work.',
    image: '/images/team/samuel-etoo.jpg',
    imageHint: 'young man confident',
    linkedin: '#',
    twitter: '#',
  },
]; 