
'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, MessageSquare, UserCircle, Briefcase, Library, ArrowRight } from 'lucide-react';
import Image from 'next/image';
// AuthGuard is now handled by the (app) layout

const features = [
  {
    title: 'AI Career Assessment',
    description: 'Discover personalized job and internship recommendations based on your unique skills and interests.',
    href: '/career-assessment',
    icon: Lightbulb,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'career guidance',
  },
  {
    title: 'AI Interview Prep',
    description: 'Practice with AI-driven mock interviews and get feedback to ace your next interview.',
    href: '/interview-prep',
    icon: MessageSquare,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'interview preparation',
  },
  {
    title: 'Profile & Resume Builder',
    description: 'Create a professional profile and build an outstanding resume with our easy-to-use tools.',
    href: '/profile-resume',
    icon: UserCircle,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'resume building',
  },
  {
    title: 'Job & Internship Search',
    description: 'Explore a wide range of job and internship opportunities aggregated from various sources.',
    href: '/opportunities',
    icon: Briefcase,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'job search',
  },
  {
    title: 'Resource Directory',
    description: 'Access scholarships, leadership programs, and mentorship opportunities to boost your career.',
    href: '/resources',
    icon: Library,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'learning resources',
  },
];

export default function DashboardPage() {
  return (
      <div className="container mx-auto">
        <PageHeader
          title="Welcome to Your Dashboard"
          description="Your AI-powered guide to navigating the Cameroonian youth job market and unlocking your potential."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 w-full">
                <Image 
                  src={feature.image} 
                  alt={feature.title} 
                  layout="fill" 
                  objectFit="cover" 
                  data-ai-hint={feature.imageHint}
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                  <feature.icon className="h-6 w-6 text-primary" />
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm h-16">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow" />
              <CardFooter>
                <Button asChild variant="default" className="w-full">
                  <Link href={feature.href}>
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
  );
}
