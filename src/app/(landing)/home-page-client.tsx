'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Briefcase, Lightbulb, Award, Users, CheckCircle, Linkedin, Twitter } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  imageHint: string;
  linkedin: string;
  twitter: string;
}

interface HomePageClientProps {
  features: Feature[];
  team: TeamMember[];
}

export function HomePageClient({ features, team }: HomePageClientProps) {
  return (
    <>
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
        <div className="container mx-auto text-center px-4">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Unlock Your <span className="text-primary">Career Potential</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
            E Hub is Cameroon's first AI-powered platform dedicated to guiding youth towards success with personalized career development tools and job matching.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
            <Button asChild size="lg" className="shadow-lg w-full sm:w-auto">
              <Link href="/signup">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="shadow-sm w-full sm:w-auto">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Functions for Students, Schools, and Employers */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-headline text-3xl font-semibold tracking-tight text-foreground">Solutions for Everyone</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              Our platform connects all stakeholders in the career development ecosystem.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {/* For Students */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">For Young Professionals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Discover your ideal career path, access job opportunities, and build professional skills.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" /> AI-powered career assessments</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" /> Personalized job recommendations</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2" /> Resume builder and interview prep</li>
                </ul>
                <Button asChild variant="link" className="px-0 text-primary">
                  <Link href="/signup">Create an account <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            {/* For Schools */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Briefcase className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">For Schools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Manage internships, track student outcomes, and connect with industry partners.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-emerald-600 mr-2" /> Web-based internship management</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-emerald-600 mr-2" /> Student placement tracking</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-emerald-600 mr-2" /> Employer engagement analytics</li>
                </ul>
                <Button asChild variant="link" className="px-0 text-emerald-600">
                  <Link href="/contact">Partner with us <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
            {/* For Employers */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">For Employers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Find top talent, post jobs and internships, and streamline your hiring process.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-blue-600 mr-2" /> Post jobs and internships</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-blue-600 mr-2" /> Access student talent pool</li>
                  <li className="flex items-center"><CheckCircle className="h-5 w-5 text-blue-600 mr-2" /> Simplified application management</li>
                </ul>
                <Button asChild variant="link" className="px-0 text-blue-600">
                  <Link href="/contact">Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-headline text-3xl font-semibold tracking-tight text-foreground">Why Choose E Hub?</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              Empowering you with the tools and insights to thrive in today&apos;s job market.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="font-headline text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                <CardContent>
                  <Button asChild variant="link" className="px-0 text-primary">
                    <Link href={feature.href}>Explore Feature <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-last md:order-first">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/students-collaborating.jpg"
                  alt="Students collaborating on a project"
                  fill
                  className="rounded-lg shadow-xl object-cover"
                  priority
                />
              </div>
            </div>
            <div>
              <h2 className="font-headline text-3xl font-semibold tracking-tight text-foreground">Your Journey to Success Starts Here</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We provide a clear, step-by-step approach to help you identify your strengths, prepare for opportunities, and connect with employers.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Personalized AI career assessments to match your skills and interests.',
                  'Interactive interview simulations with instant AI feedback.',
                  'Easy-to-use resume builder for a professional first impression.',
                  'Access to a curated database of jobs and internships in Cameroon.',
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-md">
                    <CheckCircle className="h-6 w-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="mt-8 shadow-md">
                <Link href="/signup">Join E Hub Today <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="team" className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-headline text-3xl font-semibold tracking-tight text-foreground">Meet Our Team</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto">
              Dedicated professionals committed to your career advancement.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <Card key={member.name} className="text-center shadow-lg overflow-hidden transition-all duration-300 hover:scale-105">
                <div className="relative h-56 w-full bg-muted">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-headline text-xl font-semibold text-foreground">{member.name}</h3>
                  <p className="text-md text-primary font-medium">{member.role}</p>
                  <p className="mt-3 text-sm text-muted-foreground h-20 line-clamp-4">{member.bio}</p>
                  <div className="mt-5 flex justify-center space-x-4">
                    {member.linkedin && (
                      <Link href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn Profile`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Linkedin className="h-6 w-6" />
                      </Link>
                    )}
                    {member.twitter && (
                      <Link href={member.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Twitter Profile`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Twitter className="h-6 w-6" />
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto text-center px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Take Control of Your Career?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Join thousands of young Cameroonians already building their future with E Hub. Sign up today and start your journey to success!
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="shadow-lg text-lg py-7 px-8">
                <Link href="/signup">Sign Up Now - It&apos;s Free! <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 