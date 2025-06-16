'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { 
  getInternshipProgramsForSchool, 
  addInternshipProgram,
  getSchoolIdForAdmin,
  type InternshipProgram,
  type InternshipProgramData 
} from '@/lib/firebase';
import { toast } from 'sonner';

export default function ProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProgram, setNewProgram] = useState<Partial<InternshipProgramData>>({
    title: '',
    description: '',
    requirements: '',
    status: 'draft',
  });

  useEffect(() => {
    loadPrograms();
  }, [user]);

  const loadPrograms = async () => {
    if (!user) return;
    try {
      const schoolId = await getSchoolIdForAdmin(user.uid);
      if (!schoolId) {
        toast.error('School ID not found');
        return;
      }
      const programs = await getInternshipProgramsForSchool(schoolId);
      setPrograms(programs);
    } catch (error) {
      toast.error('Failed to load programs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!user) return;
    try {
      const schoolId = await getSchoolIdForAdmin(user.uid);
      if (!schoolId) {
        toast.error('School ID not found');
        return;
      }

      const programData: InternshipProgramData = {
        ...newProgram as InternshipProgramData,
        schoolId,
        schoolName: user.displayName || 'Unknown School',
      };

      await addInternshipProgram(programData, user.uid);
      toast.success('Program created successfully');
      setIsDialogOpen(false);
      setNewProgram({
        title: '',
        description: '',
        requirements: '',
        status: 'draft',
      });
      loadPrograms();
    } catch (error) {
      toast.error('Failed to create program');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Internship Programs"
        description="Manage your school's internship programs and opportunities"
      />
      
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Internship Program</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Program Title</Label>
                <Input
                  id="title"
                  value={newProgram.title}
                  onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={newProgram.requirements}
                  onChange={(e) => setNewProgram({ ...newProgram, requirements: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newProgram.status}
                  onValueChange={(value) => setNewProgram({ ...newProgram, status: value as 'open' | 'closed' | 'draft' })}
                >
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
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProgram}>
                Create Program
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{program.title}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  program.status === 'open' ? 'bg-green-100 text-green-800' :
                  program.status === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {program.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-3">{program.description}</p>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{program.requirements}</p>
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