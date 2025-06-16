"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { getEmployerIdForUser, getJobPostingsForEmployer, addJobPosting, type JobPosting, type JobPostingData } from "@/lib/firebase";
import { toast } from "sonner";

export default function PostingsPage() {
  const { user } = useAuth();
  const [postings, setPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPosting, setNewPosting] = useState<Partial<JobPostingData>>({
    title: '',
    description: '',
    requirements: '',
    type: 'Full-time',
    location: '',
    status: 'open',
    companyName: '',
  });

  useEffect(() => {
    loadPostings();
  }, [user]);

  const loadPostings = async () => {
    if (!user) return;
    try {
      const employerId = await getEmployerIdForUser(user.uid);
      if (!employerId) {
        toast.error('Employer ID not found');
        return;
      }
      const postings = await getJobPostingsForEmployer(employerId);
      setPostings(postings);
    } catch (error) {
      toast.error('Failed to load job postings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePosting = async () => {
    if (!user) return;
    try {
      const employerId = await getEmployerIdForUser(user.uid);
      if (!employerId) {
        toast.error('Employer ID not found');
        return;
      }
      const postingData: JobPostingData = {
        ...newPosting as JobPostingData,
        employerId,
        companyName: newPosting.companyName || user.displayName || 'Unknown Company',
      };
      await addJobPosting(postingData, user.uid);
      toast.success('Job posting created successfully');
      setIsDialogOpen(false);
      setNewPosting({
        title: '',
        description: '',
        requirements: '',
        type: 'Full-time',
        location: '',
        status: 'open',
        companyName: '',
      });
      loadPostings();
    } catch (error) {
      toast.error('Failed to create job posting');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Job Postings"
        description="Manage your company's job postings and opportunities."
      />
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Posting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={newPosting.title}
                  onChange={(e) => setNewPosting({ ...newPosting, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPosting.description}
                  onChange={(e) => setNewPosting({ ...newPosting, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={newPosting.requirements}
                  onChange={(e) => setNewPosting({ ...newPosting, requirements: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newPosting.type}
                  onValueChange={(value) => setNewPosting({ ...newPosting, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newPosting.location}
                  onChange={(e) => setNewPosting({ ...newPosting, location: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newPosting.status}
                  onValueChange={(value) => setNewPosting({ ...newPosting, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={newPosting.companyName}
                  onChange={(e) => setNewPosting({ ...newPosting, companyName: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePosting}>
                Create Posting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {postings.map((posting) => (
          <Card key={posting.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{posting.title}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  posting.status === 'open' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {posting.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">{posting.description}</p>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{posting.requirements}</p>
                <div className="mt-2 text-xs text-gray-500">Type: {posting.type} | Location: {posting.location}</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 