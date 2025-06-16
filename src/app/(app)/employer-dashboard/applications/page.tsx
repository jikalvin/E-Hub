"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { getEmployerIdForUser, getJobPostingsForEmployer, getApplicationsForJobPosting, type JobApplication } from "@/lib/firebase";
import { toast } from "sonner";

export default function EmployerApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const employerId = await getEmployerIdForUser(user.uid);
      if (!employerId) {
        toast.error("Employer ID not found");
        return;
      }
      const postings = await getJobPostingsForEmployer(employerId);
      let allApplications: JobApplication[] = [];
      for (const posting of postings) {
        const apps = await getApplicationsForJobPosting(posting.id);
        allApplications = allApplications.concat(apps.map(app => ({ ...app, postingTitle: posting.title })));
      }
      setApplications(allApplications);
    } catch (error) {
      toast.error("Failed to load applications");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Job Applications"
        description="View all student applications for your company's job postings."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <span>{app.studentName} <span className="text-xs text-gray-500">({app.studentEmail})</span></span>
                <span className="text-sm font-normal text-gray-700">Job: {app.postingTitle}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <Badge variant="outline">Status: {app.status}</Badge>
              </div>
              <div>
                <span className="font-semibold">Cover Letter:</span>
                <p className="text-sm text-gray-600 line-clamp-3">{app.coverLetter || "No cover letter provided."}</p>
                {app.resumeLink && (
                  <div className="mt-2">
                    <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View Resume</a>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline" disabled>
                Update Status
              </Button>
            </CardFooter>
          </Card>
        ))}
        {!isLoading && applications.length === 0 && (
          <div className="col-span-full text-center text-gray-500">No applications found.</div>
        )}
      </div>
    </div>
  );
} 