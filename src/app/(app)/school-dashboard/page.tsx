'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/contexts/auth-context';
import {
  getSchoolIdForAdmin,
  addInternshipProgram,
  getInternshipProgramsForSchool,
  getApplicationsForProgram,  // New import
  updateApplicationStatus,   // New import
  type InternshipProgram,
  type InternshipProgramData,
  type InternshipApplication, // New import
  type ApplicationStatus     // New import
} from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Added DialogDescription
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore'; // For displaying dates

// Helper to format Firestore Timestamps
const formatDate = (timestamp: Timestamp | undefined | null, includeTime: boolean = false): string => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate();
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
};

// Applications View Dialog Component
interface ApplicationsViewDialogProps {
  program: InternshipProgram | null;
  isOpen: boolean;
  onClose: () => void;
  onApplicationStatusChange: (applicationId: string, newStatus: ApplicationStatus) => Promise<void>;
}

function ApplicationsViewDialog({ program, isOpen, onClose, onApplicationStatusChange }: ApplicationsViewDialogProps) {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (program && isOpen) {
      const fetchApplications = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const apps = await getApplicationsForProgram(program.id);
          setApplications(apps);
        } catch (e) {
          console.error(e);
          setError('Failed to fetch applications.');
          toast({ title: 'Error', description: 'Could not load applications.', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchApplications();
    }
  }, [program, isOpen, toast]);

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await onApplicationStatusChange(applicationId, newStatus);
      // Optimistically update local state or rely on parent to refresh/pass updated data
      setApplications(prevApps =>
        prevApps.map(app => app.id === applicationId ? { ...app, status: newStatus, updatedAt: Timestamp.now() } : app)
      );
    } catch (e) {
      // Error toast is handled by parent
    }
  };

  if (!program) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Applications for: {program.title}</DialogTitle>
          <DialogDescription>
            Review applications and update their status.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {error && <p className="text-destructive text-center">{error}</p>}
          {!isLoading && !error && applications.length === 0 && <p className="text-center text-muted-foreground">No applications found for this program yet.</p>}
          {!isLoading && !error && applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{app.studentName} <span className="text-sm text-muted-foreground">({app.studentEmail})</span></p>
                      <p className="text-xs text-muted-foreground">Applied: {formatDate(app.applicationDate, true)} | Updated: {formatDate(app.updatedAt, true)}</p>
                    </div>
                    <Select value={app.status} onValueChange={(newStatus: ApplicationStatus) => handleStatusChange(app.id, newStatus)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Set status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function SchoolDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [schoolNameForForm, setSchoolNameForForm] = useState(''); // Renamed for clarity
  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Main page loading
  const [error, setError] = useState<string | null>(null); // Main page error
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false); // Renamed for clarity
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [newProgramStatus, setNewProgramStatus] = useState<'open' | 'closed' | 'draft'>('draft'); // Renamed for clarity
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for viewing applications
  const [selectedProgram, setSelectedProgram] = useState<InternshipProgram | null>(null);
  const [isApplicationsViewOpen, setIsApplicationsViewOpen] = useState(false);

  const fetchSchoolInfoAndPrograms = useCallback(async () => {
    if (user && user.uid) {
      setIsLoading(true);
      setError(null);
      try {
        const sId = await getSchoolIdForAdmin(user.uid);
        if (sId) {
          setSchoolId(sId);
          const fetchedPrograms = await getInternshipProgramsForSchool(sId);
          setPrograms(fetchedPrograms);
        } else {
          setError('School ID not found for your account. Please complete your school profile or contact support.');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to fetch school information or programs.');
        toast({ title: 'Error', description: 'Could not load school data.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    } else if (!authLoading) {
      setError('You must be logged in as a school administrator to view this page.');
      setIsLoading(false);
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchSchoolInfoAndPrograms();
    }
  }, [authLoading, fetchSchoolInfoAndPrograms]);

  const resetCreateForm = () => {
    setTitle('');
    setDescription('');
    setRequirements('');
    setSchoolNameForForm('');
    setNewProgramStatus('draft');
    setIsCreateFormOpen(false);
    setIsSubmitting(false);
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast({ title: 'Error', description: 'School ID is missing.', variant: 'destructive' });
      return;
    }
    if (!schoolNameForForm.trim()) {
        toast({ title: 'Error', description: 'School Name is required.', variant: 'destructive' });
        return;
    }

    setIsSubmitting(true);
    const programData: InternshipProgramData = {
      title,
      description,
      requirements,
      status: newProgramStatus,
      schoolId,
      schoolName: schoolNameForForm.trim()
    };

    try {
      const docRef = await addInternshipProgram(programData, user!.uid);
      toast({ title: 'Success', description: `Internship program "${title}" created.` });
      // Add to local state
      setPrograms(prev => [{ ...programData, id: docRef.id, createdBy: user!.uid, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }, ...prev ]);
      resetCreateForm();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to create internship program.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (program: InternshipProgram) => {
    setSelectedProgram(program);
    setIsApplicationsViewOpen(true);
  };

  const handleApplicationStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      toast({ title: 'Success', description: `Application status updated to ${newStatus}.` });
      // The ApplicationsViewDialog will optimistically update its state.
      // Optionally, re-fetch applications for the selected program if strict consistency is needed,
      // or update the master 'programs' list if application counts are displayed there.
    } catch (error) {
      console.error('Failed to update application status:', error);
      toast({ title: 'Error', description: 'Failed to update application status.', variant: 'destructive' });
      throw error; // Re-throw to let dialog know update failed
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
      <div className="container mx-auto">
        <PageHeader title="School Dashboard" description="Error" />
        <p className="mt-4 text-destructive">{error}</p>
      </div>
    );
  }

  if (!schoolId) {
     return (
      <div className="container mx-auto">
        <PageHeader title="School Dashboard" description="Profile Incomplete" />
        <p className="mt-4">Your school administrator profile is incomplete. Please ensure your School ID is set up to access this dashboard.</p>
        {/* Optionally, guide them to a profile page or contact support */}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="School Dashboard"
        description="Manage your institution's internships and student career services."
      />

      <div className="mt-6 mb-4 flex justify-end">
        <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Internship Program</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProgram} className="space-y-4 py-4">
              <div>
                <Label htmlFor="new-title">Program Title</Label>
                <Input id="new-title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div>
                <Label htmlFor="new-schoolName">School Name (as it should appear on listings)</Label>
                <Input id="new-schoolName" value={schoolNameForForm} onChange={(e) => setSchoolNameForForm(e.target.value)} required disabled={isSubmitting} placeholder="e.g., University of Example"/>
              </div>
              <div>
                <Label htmlFor="new-description">Description</Label>
                <Textarea id="new-description" value={description} onChange={(e) => setDescription(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div>
                <Label htmlFor="new-requirements">Requirements</Label>
                <Textarea id="new-requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} required disabled={isSubmitting} />
              </div>
              <div>
                <Label htmlFor="new-status">Status</Label>
                <Select value={newProgramStatus} onValueChange={(value: 'open' | 'closed' | 'draft') => setNewProgramStatus(value)} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                   <Button type="button" variant="outline" onClick={resetCreateForm} disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Program
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {programs.length === 0 && !isLoading && (
        <p className="mt-4 text-center text-muted-foreground">No internship programs found. Get started by creating one!</p>
      )}

      {programs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground flex flex-col">
              <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
              <p className="text-sm text-muted-foreground mb-1">School: {program.schoolName}</p>
              <p className="text-sm text-muted-foreground mb-1">Status: <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${program.status === 'open' ? 'bg-green-100 text-green-700' : program.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{program.status}</span></p>
              <p className="text-sm text-muted-foreground mb-3">Created: {formatDate(program.createdAt)}</p>
              <p className="text-sm mb-3 line-clamp-3 flex-grow">{program.description}</p>
              <Button variant="outline" size="sm" className="w-full mt-auto" onClick={() => handleViewDetails(program)}>View Applications</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
