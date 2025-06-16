
'use client'; // Added use client as it uses client components (Link, Image, etc.)
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Award, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
// AuthGuard is now handled by the (app) layout

const resources = [
  {
    id: '1',
    title: 'Mandela Washington Fellowship',
    type: 'Leadership Program',
    categoryIcon: Award,
    image: 'https://placehold.co/600x400.png', imageHint: 'leadership award',
    description: 'A flagship program of the Young African Leaders Initiative (YALI) that empowers young African leaders through academic coursework, leadership training, and networking.',
    url: '#',
  },
  {
    id: '2',
    title: 'Coursera for Campus',
    type: 'Online Courses',
    categoryIcon: GraduationCap,
    image: 'https://placehold.co/600x400.png', imageHint: 'online learning',
    description: 'Access thousands of courses and Specializations from top universities and instructors worldwide to build new skills.',
    url: '#',
  },
  {
    id: '3',
    title: 'Local Tech Mentorship Network',
    type: 'Mentorship',
    categoryIcon: Users,
    image: 'https://placehold.co/600x400.png', imageHint: 'mentorship group',
    description: 'Connect with experienced tech professionals in Cameroon for guidance, support, and career advice.',
    url: '#',
  },
  {
    id: '4',
    title: 'Chevening Scholarships',
    type: 'Scholarship',
    categoryIcon: BookOpen,
    image: 'https://placehold.co/600x400.png', imageHint: 'scholarship certificate',
    description: 'Global scholarship programme of the UK government, offering awards to study in the UK for one year on a fully funded master’s degree course.',
    url: '#',
  },
];

export default function ResourcesPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Resource Directory"
        description="Explore scholarships, leadership programs, mentorship opportunities, and more to accelerate your career."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => {
          const Icon = resource.categoryIcon;
          return (
            <Card key={resource.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 w-full">
                <Image 
                  src={resource.image} 
                  alt={resource.title} 
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint={resource.imageHint}
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-xl">
                  <Icon className="h-6 w-6 text-primary" />
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-sm font-medium text-accent">{resource.type}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={resource.url}>
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {resources.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No Resources Found</h3>
          <p className="mt-2 text-muted-foreground">We are constantly updating our directory. Please check back later.</p>
        </Card>
      )}
    </div>
  );
}
