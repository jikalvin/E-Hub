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
    name: 'Birndze Bete Dzekewong',
    role: 'Founder and CEO',
    bio: 'Visionary leader with a passion for youth empowerment and innovation in Africa.',
    image: '/assets/Birndze Bete Dzekewong - Founder and CEO.jpg',
    imageHint: 'founder portrait professional',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Vanelle Sydien',
    role: 'Software Engineer',
    bio: 'Expert in software development and platform architecture, driving our technological advancement.',
    image: '/assets/Vanelle Sydien - Software Engineer.jpg',
    imageHint: 'software engineer portrait',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Nwanjoh Claudia Engwari',
    role: 'Communication and Marketing Lead',
    bio: 'Strategic communicator building bridges with our community and stakeholders across Cameroon.',
    image: '/assets/Nwanjoh Claudia Engwari - Communication and marketing lead.jpg',
    imageHint: 'marketing professional portrait',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Njoke Tangwing Raisa Ngwenyi',
    role: 'Cyber Security Expert',
    bio: 'Ensuring the security and integrity of our platform and user data.',
    image: '/assets/Njoke Tangwing Raisa Ngwenyi - Cyber Security Expert.jpg',
    imageHint: 'cyber security expert portrait',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Ghakanyuy Fabrice',
    role: 'Programs Coordinator',
    bio: 'Coordinating and managing our various programs to ensure maximum impact for youth development.',
    image: '/assets/Ghakanyuy Fabrice - Programs coordinator.jpg',
    imageHint: 'programs coordinator portrait',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Waindum Erica N.',
    role: 'Community Engagement Officer',
    bio: 'Building and nurturing relationships with our community to create meaningful engagement.',
    image: '/assets/Waindum Erica N. - Community Engagement Officer.jpg',
    imageHint: 'community engagement officer portrait',
    linkedin: '#',
    twitter: '#',
  },
]; 