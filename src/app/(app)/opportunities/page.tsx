
'use client'; // Added use client as it uses client components like Select
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Search, ArrowRight, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
// AuthGuard is now handled by the (app) layout

const opportunities = [
  {
    id: '1',
    title: 'Software Engineer Intern',
    company: 'Tech Solutions Inc.',
    logo: 'https://placehold.co/100x100.png', logoHint: 'company logo',
    location: 'Douala, Cameroon',
    type: 'Internship',
    industry: 'Technology',
    description: 'Join our dynamic team to work on cutting-edge software projects. Ideal for students passionate about coding and innovation.',
    postedDate: '2024-07-15',
    url: '#',
  },
  {
    id: '2',
    title: 'Marketing Assistant',
    company: 'ConnectPlus Agency',
    logo: 'https://placehold.co/100x100.png', logoHint: 'company logo',
    location: 'Yaoundé, Cameroon',
    type: 'Full-time',
    industry: 'Marketing',
    description: 'Support marketing campaigns, manage social media, and assist with content creation. Great entry-level role.',
    postedDate: '2024-07-12',
    url: '#',
  },
  {
    id: '3',
    title: 'Data Analyst',
    company: 'FinData Corp',
    logo: 'https://placehold.co/100x100.png', logoHint: 'company logo',
    location: 'Limbe, Cameroon',
    type: 'Full-time',
    industry: 'Finance',
    description: 'Analyze financial data, generate reports, and provide insights to support business decisions. SQL and Excel skills required.',
    postedDate: '2024-07-10',
    url: '#',
  },
  {
    id: '4',
    title: 'Graphic Design Intern',
    company: 'Creative Minds Studio',
    logo: 'https://placehold.co/100x100.png', logoHint: 'company logo',
    location: 'Bamenda, Cameroon',
    type: 'Internship',
    industry: 'Design',
    description: 'Work on diverse design projects, from branding to digital media. Portfolio required.',
    postedDate: '2024-07-18',
    url: '#',
  },
];

export default function OpportunitiesPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Job & Internship Opportunities"
        description="Find your next career move. Explore openings from various companies across Cameroon."
      />

      <Card className="mb-8 p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search by keyword</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="search" placeholder="Job title, company, or skill" className="pl-10" />
            </div>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">Type</label>
            <Select>
              <SelectTrigger id="type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
             <Select>
              <SelectTrigger id="location">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="douala">Douala</SelectItem>
                <SelectItem value="yaounde">Yaoundé</SelectItem>
                <SelectItem value="limbe">Limbe</SelectItem>
                <SelectItem value="bamenda">Bamenda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        {opportunities.map((op) => (
          <Card key={op.id} className="flex flex-col md:flex-row overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="md:w-1/4 p-4 flex items-center justify-center bg-muted/30">
               <Image 
                src={op.logo} 
                alt={`${op.company} logo`} 
                width={80} 
                height={80} 
                className="rounded-md object-contain"
                data-ai-hint={op.logoHint}
              />
            </div>
            <div className="md:w-3/4 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="font-headline text-xl hover:text-primary transition-colors">
                  <Link href={op.url}>{op.title}</Link>
                </CardTitle>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" /> {op.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {op.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" /> {op.type}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pb-3">
                <CardDescription className="text-sm line-clamp-2">{op.description}</CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-0">
                <p className="text-xs text-muted-foreground">Posted: {new Date(op.postedDate).toLocaleDateString()}</p>
                <Button asChild variant="default" size="sm">
                  <Link href={op.url}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
      {opportunities.length === 0 && (
        <Card className="p-8 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No Opportunities Found</h3>
          <p className="mt-2 text-muted-foreground">Try adjusting your search filters or check back later.</p>
        </Card>
      )}
    </div>
  );
}
