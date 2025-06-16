'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/contexts/auth-context';
import {
  getEmployerIdForUser,
  addJobPosting,
  getJobPostingsForEmployer,
  getApplicationsForJobPosting, // New
  updateJobApplicationStatus,  // New
  type JobPosting,
  type JobPostingData,
  type JobPostingStatus,
  type JobPostingType,
  type JobApplication,        // New
  type JobApplicationStatus   // New
} from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Added DialogDescription
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Briefcase } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// Helper to format Firestore Timestamps
const formatDate = (timestamp: Timestamp | undefined | null, includeTime: boolean = false): string => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate();
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
};

const jobTypes: JobPostingType[] = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Temporary'];
const jobStatuses: JobPostingStatus[] = ['draft', 'open', 'closed'];
const jobApplicationStatuses: JobApplicationStatus[] = ['pending', 'shortlisted', 'interviewing', 'offered', 'rejected', 'declined'];

// Job Applications View Dialog Component
interface JobApplicationsViewDialogProps {
  posting: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationStatusChange: (applicationId: string, newStatus: JobApplicationStatus) => Promise<void>;
}

function JobApplicationsViewDialog({ posting, isOpen, onClose, onApplicationStatusChange }: JobApplicationsViewDialogProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [errorApps, setErrorApps] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (posting && isOpen) {
      const fetchApplications = async () => {
        setIsLoadingApps(true);
        setErrorApps(null);
        try {
          const apps = await getApplicationsForJobPosting(posting.id);
          setApplications(apps);
        } catch (e) {
          console.error(e);
          setErrorApps('Failed to fetch applications.');
          toast({ title: 'Error', description: 'Could not load job applications.', variant: 'destructive' });
        } finally {
          setIsLoadingApps(false);
        }
      };
      fetchApplications();
    }
  }, [posting, isOpen, toast]);

  const handleStatusChange = async (applicationId: string, newStatus: JobApplicationStatus) => {
    try {
      await onApplicationStatusChange(applicationId, newStatus);
      setApplications(prevApps =>
        prevApps.map(app => app.id === applicationId ? { ...app, status: newStatus, updatedAt: Timestamp.now() } : app)
      );
    } catch (e) { /* Parent handles toast for error */ }
  };

  if (!posting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Applications for: {posting.title}</DialogTitle>
          <DialogDescription>Review applications and update their status for this job posting.</DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {isLoadingApps && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {errorApps && <p className="text-destructive text-center">{errorApps}</p>}
          {!isLoadingApps && !errorApps && applications.length === 0 && <p className="text-center text-muted-foreground">No applications found for this job posting yet.</p>}
          {!isLoadingApps && !errorApps && applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{app.studentName} <span className="text-sm text-muted-foreground">({app.studentEmail})</span></p>
                      <p className="text-xs text-muted-foreground">Applied: {formatDate(app.applicationDate, true)} | Updated: {formatDate(app.updatedAt, true)}</p>
                      {app.resumeLink && <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View Resume</a>}
                    </div>
                    <Select value={app.status} onValueChange={(newStatus: JobApplicationStatus) => handleStatusChange(app.id, newStatus)}>
                      <SelectTrigger className="w-[150px]"> <SelectValue placeholder="Set status" /> </SelectTrigger>
                      <SelectContent>
                        {jobApplicationStatuses.map(statusVal => (
                          <SelectItem key={statusVal} value={statusVal} className="capitalize">{statusVal}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {app.coverLetter && (
                    <div className="mt-3">
                      <p className="text-sm font-medium">Cover Letter:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-slate-50 p-2 rounded-md">{app.coverLetter}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter> <Button variant="outline" onClick={onClose}>Close</Button> </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function EmployerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [employerId, setEmployerId] = useState<string | null>(null);
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Main page loading
  const [error, setError] = useState<string | null>(null); // Main page error

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(''); // Employer enters this for now
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [jobType, setJobType] = useState<JobPostingType>('Full-time');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<JobPostingStatus>('draft');

  const fetchEmployerInfoAndPostings = useCallback(async () => {
    if (user && user.uid) {
      setIsLoading(true);
      setError(null);
      try {
        const eId = await getEmployerIdForUser(user.uid);
        if (eId) {
          setEmployerId(eId);
          const fetchedPostings = await getJobPostingsForEmployer(eId);
          setPostings(fetchedPostings);
        } else {
          setError('Employer ID not found for your account. Please complete your company profile or contact support.');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to fetch employer information or job postings.');
        toast({ title: 'Error', description: 'Could not load your data.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    } else if (!authLoading) {
      setError('You must be logged in as an employer to view this page.');
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchEmployerInfoAndPostings();
    }
  }, [authLoading, fetchEmployerInfoAndPostings]);

  const resetCreateForm = () => {
    setTitle('');
    setCompanyName('');
    setDescription('');
    setRequirements('');
    setJobType('Full-time');
    setLocation('');
    setStatus('draft');
    setIsCreateFormOpen(false);
    setIsSubmitting(false);
  };

  const handleCreatePosting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerId) {
      toast({ title: 'Error', description: 'Employer ID is missing.', variant: 'destructive' });
      return;
    }
    if (!companyName.trim()) {
      toast({ title: 'Error', description: 'Company Name is required.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const postingData: JobPostingData = {
      title,
      companyName: companyName.trim(),
      description,
      requirements,
      type: jobType,
      location,
      status,
      employerId,
    };

    try {
      const docRef = await addJobPosting(postingData, user!.uid);
      toast({ title: 'Success', description: `Job posting "${title}" created.` });
      setPostings(prev => [{ ...postingData, id: docRef.id, createdBy: user!.uid, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }, ...prev ]);
      resetCreateForm();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to create job posting.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <PageHeader title="Employer Dashboard" description="Error" />
        <p className="mt-4 text-destructive">{error}</p>
      </div>
    );
  }

  if (!employerId) {
     return (
      <div className="container mx-auto py-8">
        <PageHeader title="Employer Dashboard" description="Profile Incomplete" />
        <p className="mt-4">Your employer profile is incomplete. Please ensure your Employer ID is set up to access this dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Employer Dashboard"
        description="Manage your job postings and connect with candidates."
      />

      <div className="mt-6 mb-4 flex justify-end">
        <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Job Posting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePosting} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="job-title">Job Title</Label>
                <Input id="job-title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div>
                <Label htmlFor="job-companyName">Company Name (as it should appear on listings)</Label>
                <Input id="job-companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required disabled={isSubmitting} placeholder="e.g., Your Company Inc."/>
              </div>
              <div>
                <Label htmlFor="job-description">Description</Label>
                <Textarea id="job-description" value={description} onChange={(e) => setDescription(e.target.value)} required disabled={isSubmitting} rows={4}/>
              </div>
              <div>
                <Label htmlFor="job-requirements">Requirements</Label>
                <Textarea id="job-requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} required disabled={isSubmitting} rows={4}/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job-type">Type</Label>
                  <Select value={jobType} onValueChange={(value: JobPostingType) => setJobType(value)} disabled={isSubmitting}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {jobTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="job-location">Location</Label>
                  <Input id="job-location" value={location} onChange={(e) => setLocation(e.target.value)} required disabled={isSubmitting} placeholder="e.g., Douala, Cameroon"/>
                </div>
              </div>
              <div>
                <Label htmlFor="job-status">Status</Label>
                <Select value={status} onValueChange={(value: JobPostingStatus) => setStatus(value)} disabled={isSubmitting}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {jobStatuses.map(st => <SelectItem key={st} value={st} className="capitalize">{st}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                   <Button type="button" variant="outline" onClick={resetCreateForm} disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Posting
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {postings.length === 0 && !isLoading && (
        <p className="mt-4 text-center text-muted-foreground">No job postings found. Get started by creating one!</p>
      )}

      {postings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {postings.map((posting) => (
            <div key={posting.id} className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground flex flex-col">
              <h3 className="text-xl font-semibold mb-2">{posting.title}</h3>
              <p className="text-sm text-muted-foreground mb-1"><Briefcase className="inline h-4 w-4 mr-1"/> {posting.type} at {posting.companyName}</p>
              <p className="text-sm text-muted-foreground mb-1">Status: <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${posting.status === 'open' ? 'bg-green-100 text-green-700' : posting.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{posting.status}</span></p>
              <p className="text-sm text-muted-foreground mb-3">Created: {formatDate(posting.createdAt)}</p>
              <p className="text-sm mb-3 line-clamp-3 flex-grow">{posting.description}</p>
              {/* TODO: Add View Applications/Edit/Delete buttons later */}
              <Button variant="outline" size="sm" className="w-full mt-auto" disabled>View Applications (TBD)</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
