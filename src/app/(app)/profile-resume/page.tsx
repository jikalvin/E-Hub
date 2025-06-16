'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Separator } from '@/components/ui/separator'; // Not used directly
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Download, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context'; // For pre-filling info
// AuthGuard is now handled by the (app) layout

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  address: string;
}

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  year: string;
  details: string;
}

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface SkillEntry {
  id: string;
  name: string;
  level: string; 
}

const initialPersonalInfo: PersonalInfo = {
  fullName: '', email: '', phone: '', linkedin: '', portfolio: '', address: '',
};
const initialEducation: EducationEntry[] = [];
const initialExperience: ExperienceEntry[] = [];
const initialSkills: SkillEntry[] = [];


export default function ProfileResumePage() {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialPersonalInfo);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(initialEducation);
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>(initialExperience);
  const [skills, setSkills] = useState<SkillEntry[]>(initialSkills);
  const [summary, setSummary] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setPersonalInfo(prev => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);


  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const addEducationEntry = () => {
    setEducationEntries([...educationEntries, { id: Date.now().toString(), degree: '', institution: '', year: '', details: '' }]);
  };
  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updated = [...educationEntries];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setEducationEntries(updated);
  };
  const removeEducationEntry = (id: string) => {
    setEducationEntries(educationEntries.filter(entry => entry.id !== id));
  };
  
  const addExperienceEntry = () => {
    setExperienceEntries([...experienceEntries, { id: Date.now().toString(), title: '', company: '', startDate: '', endDate: '', description: '' }]);
  };
  const handleExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updated = [...experienceEntries];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setExperienceEntries(updated);
  };
  const removeExperienceEntry = (id: string) => {
    setExperienceEntries(experienceEntries.filter(entry => entry.id !== id));
  };

  const addSkillEntry = () => {
    setSkills([...skills, { id: Date.now().toString(), name: '', level: 'Intermediate' }]);
  };
  const handleSkillChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setSkills(updated);
  };
  const removeSkillEntry = (id: string) => {
    setSkills(skills.filter(entry => entry.id !== id));
  };

  const handleDownload = () => {
    toast({ title: 'Download Resume', description: 'PDF download functionality is not yet implemented.' });
    console.log({ personalInfo, educationEntries, experienceEntries, skills, summary });
  };
  
  const togglePreview = () => setIsPreviewing(!isPreviewing);

  const ResumePreview = () => (
    <Card className="mt-8 p-6 shadow-lg">
      <CardHeader className="border-b pb-4 mb-4">
        <CardTitle className="font-headline text-3xl text-center">{personalInfo.fullName || "Your Name"}</CardTitle>
        <CardDescription className="text-center space-x-1">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.email && '|'} {personalInfo.phone}</span>}
          {personalInfo.address && <span>{(personalInfo.email || personalInfo.phone) && '|'} {personalInfo.address}</span>}
          <br/>
          {personalInfo.linkedin && <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>}
          {personalInfo.portfolio && <span> {personalInfo.linkedin && '|'} <a href={personalInfo.portfolio.startsWith('http') ? personalInfo.portfolio : `https://${personalInfo.portfolio}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Portfolio</a></span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {summary && (
          <section>
            <h2 className="font-headline text-xl font-semibold border-b pb-1 mb-2">Summary</h2>
            <p className="text-sm whitespace-pre-line">{summary}</p>
          </section>
        )}
        {experienceEntries.length > 0 && (
          <section>
            <h2 className="font-headline text-xl font-semibold border-b pb-1 mb-2">Experience</h2>
            {experienceEntries.map(exp => (
              <div key={exp.id} className="mb-3">
                <h3 className="font-semibold text-lg">{exp.title || "Job Title"}</h3>
                <p className="text-md font-medium">{exp.company || "Company Name"}</p>
                <p className="text-xs text-muted-foreground">{exp.startDate || "Start Date"} - {exp.endDate || "End Date"}</p>
                <p className="text-sm whitespace-pre-line mt-1">{exp.description || "Job description..."}</p>
              </div>
            ))}
          </section>
        )}
        {educationEntries.length > 0 && (
          <section>
            <h2 className="font-headline text-xl font-semibold border-b pb-1 mb-2">Education</h2>
            {educationEntries.map(edu => (
              <div key={edu.id} className="mb-3">
                <h3 className="font-semibold text-lg">{edu.degree || "Degree"}</h3>
                <p className="text-md font-medium">{edu.institution || "Institution"}</p>
                <p className="text-xs text-muted-foreground">{edu.year || "Year"}</p>
                {edu.details && <p className="text-sm mt-1">{edu.details}</p>}
              </div>
            ))}
          </section>
        )}
        {skills.length > 0 && (
          <section>
            <h2 className="font-headline text-xl font-semibold border-b pb-1 mb-2">Skills</h2>
            <ul className="list-disc list-inside grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
              {skills.map(skill => (
                <li key={skill.id}>{skill.name || "Skill"} <span className="text-muted-foreground">({skill.level || "Level"})</span></li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Profile & Resume Builder"
        description="Create a standout professional profile and craft a compelling resume."
        actions={
          <div className="flex gap-2">
            <Button onClick={togglePreview} variant="outline">
              <Eye className="mr-2 h-4 w-4" /> {isPreviewing ? "Edit Resume" : "Preview Resume"}
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        }
      />

      {isPreviewing ? <ResumePreview /> : (
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="font-headline">Personal Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={personalInfo.fullName} onChange={handlePersonalInfoChange} placeholder="Your full name"/></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={personalInfo.email} onChange={handlePersonalInfoChange} placeholder="your.email@example.com"/></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="+237 6XX XXX XXX"/></div>
              <div><Label htmlFor="address">Address</Label><Input id="address" name="address" value={personalInfo.address} onChange={handlePersonalInfoChange} placeholder="City, Country"/></div>
              <div><Label htmlFor="linkedin">LinkedIn Profile URL</Label><Input id="linkedin" name="linkedin" value={personalInfo.linkedin} onChange={handlePersonalInfoChange} placeholder="linkedin.com/in/yourprofile"/></div>
              <div><Label htmlFor="portfolio">Portfolio/Website URL</Label><Input id="portfolio" name="portfolio" value={personalInfo.portfolio} onChange={handlePersonalInfoChange} placeholder="yourportfolio.com"/></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-headline">Professional Summary</CardTitle></CardHeader>
            <CardContent>
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A brief (2-3 sentences) overview of your career goals, key skills, and experience..." className="min-h-[100px]" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline">Work Experience</CardTitle>
              <Button variant="outline" size="sm" onClick={addExperienceEntry}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {experienceEntries.length === 0 && <p className="text-sm text-muted-foreground">No work experience added yet.</p>}
              {experienceEntries.map((entry, index) => (
                <div key={entry.id} className="p-4 border rounded-md space-y-3 relative bg-card/50">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeExperienceEntry(entry.id)} aria-label="Remove experience entry"><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label htmlFor={`exp-title-${index}`}>Job Title</Label><Input id={`exp-title-${index}`} name="title" value={entry.title} onChange={(e) => handleExperienceChange(index, e)} /></div>
                    <div><Label htmlFor={`exp-company-${index}`}>Company</Label><Input id={`exp-company-${index}`} name="company" value={entry.company} onChange={(e) => handleExperienceChange(index, e)} /></div>
                    <div><Label htmlFor={`exp-startDate-${index}`}>Start Date</Label><Input id={`exp-startDate-${index}`} name="startDate" type="month" value={entry.startDate} onChange={(e) => handleExperienceChange(index, e)} /></div>
                    <div><Label htmlFor={`exp-endDate-${index}`}>End Date</Label><Input id={`exp-endDate-${index}`} name="endDate" type="month" value={entry.endDate} onChange={(e) => handleExperienceChange(index, e)} placeholder="Or 'Present'"/></div>
                  </div>
                  <div><Label htmlFor={`exp-description-${index}`}>Description</Label><Textarea id={`exp-description-${index}`} name="description" value={entry.description} onChange={(e) => handleExperienceChange(index, e)} placeholder="Key responsibilities and achievements (use bullet points for clarity)..." className="min-h-[80px]" /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline">Education</CardTitle>
              <Button variant="outline" size="sm" onClick={addEducationEntry}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {educationEntries.length === 0 && <p className="text-sm text-muted-foreground">No education entries added yet.</p>}
              {educationEntries.map((entry, index) => (
                <div key={entry.id} className="p-4 border rounded-md space-y-3 relative bg-card/50">
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeEducationEntry(entry.id)} aria-label="Remove education entry"><Trash2 className="h-4 w-4" /></Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><Label htmlFor={`edu-degree-${index}`}>Degree/Certificate</Label><Input id={`edu-degree-${index}`} name="degree" value={entry.degree} onChange={(e) => handleEducationChange(index, e)} /></div>
                    <div><Label htmlFor={`edu-institution-${index}`}>Institution</Label><Input id={`edu-institution-${index}`} name="institution" value={entry.institution} onChange={(e) => handleEducationChange(index, e)} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <div><Label htmlFor={`edu-year-${index}`}>Year of Completion</Label><Input id={`edu-year-${index}`} name="year" type="number" placeholder="YYYY" value={entry.year} onChange={(e) => handleEducationChange(index, e)} /></div>
                  </div>
                  <div><Label htmlFor={`edu-details-${index}`}>Details (Optional)</Label><Textarea id={`edu-details-${index}`} name="details" value={entry.details} onChange={(e) => handleEducationChange(index, e)} placeholder="e.g., GPA, honors, relevant coursework, thesis title..." className="min-h-[60px]" /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline">Skills</CardTitle>
              <Button variant="outline" size="sm" onClick={addSkillEntry}><PlusCircle className="mr-2 h-4 w-4" /> Add Skill</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
              {skills.map((entry, index) => (
                <div key={entry.id} className="p-4 border rounded-md grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-3 items-end relative bg-card/50">
                  <div className="md:col-span-1"><Label htmlFor={`skill-name-${index}`}>Skill Name</Label><Input id={`skill-name-${index}`} name="name" value={entry.name} onChange={(e) => handleSkillChange(index, e)} /></div>
                  <div>
                    <Label htmlFor={`skill-level-${index}`}>Proficiency</Label>
                    <select id={`skill-level-${index}`} name="level" value={entry.level} onChange={(e) => handleSkillChange(index, e)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 self-end md:ml-2" onClick={() => removeSkillEntry(entry.id)} aria-label="Remove skill entry"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
