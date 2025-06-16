'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, type UserRole } from '@/contexts/auth-context'; // Import UserRole
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import { Icons } from '@/components/icons';
import { siteConfig } from '@/config/site';

export function SignupForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student'); // Add role state
  const { signUp, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters long.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    // Pass role to signUp function
    const user = await signUp(email, password, displayName, role);
    if (user) {
      toast({ title: 'Sign Up Successful', description: 'Welcome! Your account has been created.' });
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      router.push(redirectUrl);
    }
    // Errors are handled by useAuth hook's toast via the signUp method
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-foreground hover:text-primary transition-colors">
        <Icons.Logo className="h-7 w-7" />
        <span className="font-headline text-lg font-semibold">{siteConfig.name}</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl border-border">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Create Your Account</CardTitle>
          <CardDescription>Join E Hub and take the next step in your career.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="e.g. John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={isSubmitting || authLoading}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting || authLoading}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting || authLoading}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting || authLoading}
                className="text-base"
              />
            </div>

            {/* Role Selection Radio Group */}
            <div className="space-y-2">
              <Label htmlFor="role">I am a:</Label>
              <RadioGroup
                defaultValue="student"
                onValueChange={(value: string) => setRole(value as UserRole)}
                className="mt-2 mb-4"
                id="role"
                disabled={isSubmitting || authLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="role-student" />
                  <Label htmlFor="role-student" className="font-normal">Student / Young Professional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="school_admin" id="role-school" />
                  <Label htmlFor="role-school" className="font-normal">School / University Staff</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employer" id="role-employer" />
                  <Label htmlFor="role-employer" className="font-normal">Employer</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full text-base py-6" disabled={isSubmitting || authLoading}>
              {(isSubmitting || authLoading) ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 