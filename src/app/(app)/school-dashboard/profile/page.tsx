"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import {
  getSchoolIdForAdmin,
  updateSchoolProfile,
  db,
} from "@/lib/firebase";
import { getDoc, doc, collection } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SchoolProfileData {
  name: string;
  address: string;
  contactEmail: string;
  phone: string;
  website: string;
  logoUrl?: string;
  description?: string;
}

export default function SchoolProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<SchoolProfileData>({
    name: "",
    address: "",
    contactEmail: "",
    phone: "",
    website: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolProfile = useCallback(async () => {
    if (!user || !user.uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const sId = await getSchoolIdForAdmin(user.uid);
      if (sId) {
        setSchoolId(sId);
        const schoolDocRef = doc(db, "schools", sId);
        const schoolSnap = await getDoc(schoolDocRef);
        if (schoolSnap.exists()) {
          setProfileData(schoolSnap.data() as SchoolProfileData);
        }
      } else {
        // If no schoolId is found, it means a new profile needs to be created.
        // We'll generate a new ID on submission if one isn't present.
        setSchoolId(null); // Explicitly set to null if not found
      }
    } catch (e) {
      console.error("Error fetching school profile:", e);
      setError("Failed to load school profile.");
      toast.error("Failed to load school profile.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchSchoolProfile();
    }
  }, [authLoading, fetchSchoolProfile]);

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

    // Basic validation
    if (!profileData.name || !profileData.contactEmail || !profileData.address || !profileData.phone || !profileData.website) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      let currentSchoolId = schoolId;
      if (!currentSchoolId) {
        // Generate a new ID if creating a new school profile
        currentSchoolId = doc(collection(db, 'schools')).id;
        setSchoolId(currentSchoolId); // Update state with the new ID
      }

      if (currentSchoolId) { // Ensure currentSchoolId is not null before proceeding
        await updateSchoolProfile(user.uid, currentSchoolId, profileData);
        toast.success("School profile updated successfully!");
      } else {
        toast.error("Failed to generate a school ID.");
      }
      // Optionally redirect or show success state
    } catch (e) {
      console.error("Error saving school profile:", e);
      toast.error("Failed to save school profile.");
      setError("Failed to save school profile.");
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
        title="School Profile"
        description="Manage your school's information."
      />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 border rounded-lg shadow-md">
        {error && <p className="text-destructive text-center">{error}</p>}
        <div className="grid gap-2">
          <Label htmlFor="name">School Name</Label>
          <Input id="name" value={profileData.name} onChange={handleChange} required />
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
          {schoolId ? "Update Profile" : "Create Profile"}
        </Button>
      </form>
    </div>
  );
} 