"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import {
  getEmployerIdForUser,
  updateEmployerProfile,
  db,
} from "@/lib/firebase";
import { getDoc, doc, collection } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EmployerProfileData {
  companyName: string;
  address: string;
  contactEmail: string;
  phone: string;
  website: string;
  logoUrl?: string;
  description?: string;
}

export default function EmployerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<EmployerProfileData>({
    companyName: "",
    address: "",
    contactEmail: "",
    phone: "",
    website: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployerProfile = useCallback(async () => {
    if (!user || !user.uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const eId = await getEmployerIdForUser(user.uid);
      if (eId) {
        setEmployerId(eId);
        const employerDocRef = doc(db, "employers", eId);
        const employerSnap = await getDoc(employerDocRef);
        if (employerSnap.exists()) {
          setProfileData(employerSnap.data() as EmployerProfileData);
        }
      } else {
        setEmployerId(null);
      }
    } catch (e) {
      console.error("Error fetching employer profile:", e);
      setError("Failed to load employer profile.");
      toast.error("Failed to load employer profile.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchEmployerProfile();
    }
  }, [authLoading, fetchEmployerProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.uid) {
      toast.error("User not authenticated.");
      return;
    }

    if (!profileData.companyName || !profileData.contactEmail || !profileData.address || !profileData.phone || !profileData.website) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      let currentEmployerId = employerId;
      if (!currentEmployerId) {
        currentEmployerId = doc(collection(db, 'employers')).id;
        setEmployerId(currentEmployerId);
      }

      if (currentEmployerId) {
        await updateEmployerProfile(user.uid, currentEmployerId, profileData);
        toast.success("Employer profile updated successfully!");
      } else {
        toast.error("Failed to generate an employer ID.");
      }
    } catch (e) {
      console.error("Error saving employer profile:", e);
      toast.error("Failed to save employer profile.");
      setError("Failed to save employer profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Company Profile"
        description="Manage your company's information."
      />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 border rounded-lg shadow-md">
        {error && <p className="text-destructive text-center">{error}</p>}
        <div className="grid gap-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" value={profileData.companyName} onChange={handleChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={profileData.address} onChange={handleChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" type="email" value={profileData.contactEmail} onChange={handleChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={profileData.phone} onChange={handleChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={profileData.website} onChange={handleChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <Input id="logoUrl" value={profileData.logoUrl || ""} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea id="description" value={profileData.description || ""} onChange={handleChange} />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {employerId ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </div>
  );
} 