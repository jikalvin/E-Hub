
'use client'; // Added use client as it uses client components like Select
import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Keep for filters
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Search, ArrowRight, Building, Loader2, Send } from 'lucide-react'; // Added Send for apply button
import Link from 'next/link'; // Keep if any internal links remain for details, or remove
// import Image from 'next/image'; // Remove if not using program logos for now
import { useAuth } from '@/contexts/auth-context';
import {
  getOpenInternshipPrograms,
  applyForInternship,
  getOpenJobPostings, // New
  applyForJob,        // New
  type InternshipProgram,
  type ApplyForInternshipData,
  type JobPosting,      // New
  type ApplyForJobData   // New
} from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';

// Helper to format Firestore Timestamps
const formatDate = (timestamp: Timestamp | undefined | null): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleDateString();
};

// Define a union type for opportunities
type Opportunity = (InternshipProgram & { itemType: 'internship' }) | (JobPosting & { itemType: 'job' });

export default function OpportunitiesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeLink, setResumeLink] = useState(''); // For job applications
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [internshipResults, jobResults] = await Promise.all([
          getOpenInternshipPrograms(),
          getOpenJobPostings()
        ]);

        const combinedOpportunities: Opportunity[] = [
          ...internshipResults.map(p => ({ ...p, itemType: 'internship' as const })),
          ...jobResults.map(j => ({ ...j, itemType: 'job' as const }))
        ];

        // Sort by creation date, newest first
        combinedOpportunities.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        setOpportunities(combinedOpportunities);
      } catch (e) {
        console.error(e);
        setError('Failed to fetch opportunities.');
        toast({ title: 'Error', description: 'Could not load opportunities.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, [toast]);

  const handleApplyClick = (opportunity: Opportunity) => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to apply.', variant: 'destructive'});
      return;
    }
    setSelectedOpportunity(opportunity);
    setCoverLetter('');
    setResumeLink(''); // Reset resume link
    setIsApplyDialogOpen(true);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity || !user) {
      toast({ title: 'Error', description: 'No opportunity selected or user not logged in.', variant: 'destructive' });
      return;
    }

    setIsSubmittingApplication(true);

    try {
      if (selectedOpportunity.itemType === 'internship') {
        const applicationData: ApplyForInternshipData = {
          studentId: user.uid,
          internshipProgramId: selectedOpportunity.id,
          schoolId: selectedOpportunity.schoolId,
          coverLetter: coverLetter.trim(),
        };
        await applyForInternship(applicationData);
      } else if (selectedOpportunity.itemType === 'job') {
        const applicationData: ApplyForJobData = {
          studentId: user.uid,
          jobPostingId: selectedOpportunity.id,
          employerId: selectedOpportunity.employerId,
          coverLetter: coverLetter.trim(),
          resumeLink: resumeLink.trim(),
        };
        await applyForJob(applicationData);
      }
      toast({ title: 'Application Submitted!', description: `Your application for "${selectedOpportunity.title}" has been sent.` });
      setIsApplyDialogOpen(false);
      setSelectedOpportunity(null);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Application Failed', description: err.message || 'Could not submit your application.', variant: 'destructive' });
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  // TODO: Implement actual search and filter logic if needed, or remove the UI elements.
  // For now, they are just placeholders.

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Explore Opportunities"
        description="Find internships and job openings from various schools and employers."
      />

      {/* Search and Filter Bar - Placeholder for now */}
      <Card className="mb-8 p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium mb-1">Search by keyword</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="search" placeholder="Title, company, skill" className="pl-10" disabled />
            </div>
          </div>
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium mb-1">Type</label>
            <Select disabled>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              {/* <SelectContent> <SelectItem value="all">All Types</SelectItem> <SelectItem value="internship">Internship</SelectItem> <SelectItem value="job">Job</SelectItem> </SelectContent> */}
            </Select>
          </div>
          <div>
            <label htmlFor="location-filter" className="block text-sm font-medium mb-1">Location (Filter TBD)</label>
             <Select disabled>
              <SelectTrigger id="location-filter">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              {/* <SelectContent> ...locations... </SelectContent> */}
            </Select>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {error && <p className="text-center text-destructive">{error}</p>}

      {!isLoading && !error && opportunities.length === 0 && (
        <Card className="p-8 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">No Open Opportunities Found</h3>
          <p className="mt-2 text-muted-foreground">Please check back later for new internships or job openings.</p>
        </Card>
      )}

      {!isLoading && !error && opportunities.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {opportunities.map((op) => (
            <Card key={`${op.itemType}-${op.id}`} className="flex flex-col md:flex-row overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="font-headline text-xl hover:text-primary transition-colors">
                    {op.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" /> {op.itemType === 'internship' ? op.schoolName : op.companyName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {op.itemType === 'internship' ? 'Internship' : op.type}
                    </div>
                    {op.itemType === 'job' && op.location && (
                       <div className="flex items-center gap-1"> <MapPin className="h-4 w-4" /> {op.location} </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pb-3">
                  <p className="text-sm font-medium mb-1">Description:</p>
                  <CardDescription className="text-sm line-clamp-3 mb-2">{op.description}</CardDescription>
                  <p className="text-sm font-medium mb-1">Requirements:</p>
                  <CardDescription className="text-sm line-clamp-2">{op.requirements}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-0">
                  <p className="text-xs text-muted-foreground">Posted: {formatDate(op.createdAt)}</p>
                  <Button variant="default" size="sm" onClick={() => handleApplyClick(op)} disabled={authLoading}>
                    Apply Now <Send className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Application Dialog */}
      {selectedOpportunity && (
        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Apply for: {selectedOpportunity.title}</DialogTitle>
              <DialogDescription>
                Submit your application for the {selectedOpportunity.itemType} at {selectedOpportunity.itemType === 'internship' ? selectedOpportunity.schoolName : selectedOpportunity.companyName}.
                <br/>Your name ({user?.displayName}) and email ({user?.email}) will be automatically included.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApplicationSubmit} className="space-y-4 py-2">
              <div>
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={`Explain why you're a good fit for this ${selectedOpportunity.itemType}...`}
                  rows={5}
                  disabled={isSubmittingApplication}
                />
              </div>
              {selectedOpportunity.itemType === 'job' && (
                <div>
                  <Label htmlFor="resumeLink">Resume Link (Optional)</Label>
                  <Input
                    id="resumeLink"
                    value={resumeLink}
                    onChange={(e) => setResumeLink(e.target.value)}
                    placeholder="https://example.com/your-resume.pdf"
                    disabled={isSubmittingApplication}
                  />
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmittingApplication}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmittingApplication || authLoading}>
                  {isSubmittingApplication ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Submit Application
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
