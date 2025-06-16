'use client';

import type { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Import db
import { onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import firestore functions
import type { FirebaseError } from 'firebase/app';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createUserProfile } from '@/lib/firebase'; // Import createUserProfile

// Define UserRole type
export type UserRole = 'student' | 'school_admin' | 'employer' | null;

interface AuthContextType {
  user: User | null;
  userRole: UserRole; // Add userRole
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string, role?: UserRole) => Promise<User | null>; // Add role to signUp
  signIn: (email: string, password: string) => Promise<{ user: User; role: UserRole } | null>; // Updated return type
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null); // Initialize userRole state
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Attempt to fetch role from Firestore
        try {
          const userProfileDoc = await getDoc(doc(db, 'userProfiles', currentUser.uid));
          if (userProfileDoc.exists() && userProfileDoc.data()?.role) { // Check if role exists
            setUserRole(userProfileDoc.data()?.role as UserRole);
          } else {
            // This case might happen for users created before this system
            // Or if profile creation failed.
            // We will set it to 'student' for now after signUp if not set.
            // If user exists but no profile/role, onAuthStateChanged might set it to null or a default.
            // Let's ensure signUp sets a role, and here we only set if profile exists.
            // If profile doesn't exist after sign-up (which it should), this means an issue.
            // For existing users without profile, this will make userRole null initially.
            // Consider a default role here if that's desired for users without profiles.
            setUserRole(userProfileDoc.exists() ? (userProfileDoc.data()?.role as UserRole || 'student') : 'student');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserRole('student'); // Default on error
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string, role?: UserRole): Promise<User | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        if (displayName) {
          await updateProfile(user, { displayName });
        }
        // Create user profile in Firestore
        const assignedRole = role || 'student'; // Default role to 'student' if not provided
        await createUserProfile(user.uid, assignedRole, { email, displayName });

        // Set user and role state
        setUser(user); // Set user state immediately
        setUserRole(assignedRole); // Set role state immediately

        // It's good practice to return the user object as it is now (possibly without displayName immediately updated on it from Firebase's perspective)
        // or refetch if strict consistency of the returned object is needed, though onAuthStateChanged will also run.
        return user; // Return the user from userCredential
      }
      return null;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error('Sign up error:', firebaseError.message);
      toast({ title: 'Sign Up Failed', description: firebaseError.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ user: User; role: UserRole } | null> => {
    setLoading(true);
    let fetchedUserRole: UserRole = 'student'; // Default role, will be updated
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;
      setUser(loggedInUser);

      // Fetch user role from Firestore
      if (loggedInUser) {
        try {
          const userProfileDoc = await getDoc(doc(db, 'userProfiles', loggedInUser.uid));
          if (userProfileDoc.exists() && userProfileDoc.data()?.role) {
            fetchedUserRole = userProfileDoc.data()?.role as UserRole;
          } else {
            // Fallback if profile or role field doesn't exist, though it should for signed-up users
            fetchedUserRole = 'student';
          }
        } catch (profileError) {
          console.error("Error fetching user profile during sign in:", profileError);
          // Keep default 'student' or handle error as critical if role is mandatory for app function
          fetchedUserRole = 'student';
        }
      }
      setUserRole(fetchedUserRole); // Update context state
      return { user: loggedInUser, role: fetchedUserRole };

    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error('Sign in error:', firebaseError.message);
      toast({ title: 'Sign In Failed', description: firebaseError.message, variant: 'destructive' });
      // Ensure user and role are reset on failed sign-in attempt if they were partially set
      setUser(null);
      setUserRole(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserRole(null); // Reset userRole on sign out
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error('Sign out error:', firebaseError.message);
      toast({ title: 'Sign Out Failed', description: firebaseError.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
