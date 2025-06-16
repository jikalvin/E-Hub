"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { getSchoolIdForAdmin, getInternshipProgramsForSchool, getApplicationsForProgram, type InternshipApplication } from "@/lib/firebase";
import { toast } from "sonner";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
    // eslint-disable-next-line
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const schoolId = await getSchoolIdForAdmin(user.uid);
      if (!schoolId) {
        toast.error("School ID not found");
        return;
      }
      const programs = await getInternshipProgramsForSchool(schoolId);
      let allApplications: InternshipApplication[] = [];
      for (const program of programs) {
        const apps = await getApplicationsForProgram(program.id);
        allApplications = allApplications.concat(apps.map(app => ({ ...app, programTitle: program.title })));
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
        title="Internship Applications"
        description="View and manage all student applications for your school's internship programs."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <CardTitle className="flex flex-col gap-1">
                <span>{app.studentName} <span className="text-xs text-gray-500">({app.studentEmail})</span></span>
                <span className="text-sm font-normal text-gray-700">Program: {app.programTitle}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <Badge variant="outline">Status: {app.status}</Badge>
              </div>
              <div>
                <span className="font-semibold">Cover Letter:</span>
                <p className="text-sm text-gray-600 line-clamp-3">{app.coverLetter || "No cover letter provided."}</p>
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