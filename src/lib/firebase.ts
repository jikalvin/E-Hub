import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc, // Added getDoc
  Timestamp,
  type Firestore,
  type DocumentReference
} from 'firebase/firestore'; // Import Firestore and additional functions
import type { UserRole } from '@/contexts/auth-context'; // Import UserRole

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app); // Initialize Firestore

// Function to create user profile
export const createUserProfile = async (userId: string, role: UserRole, additionalData?: object): Promise<void> => {
  try {
    const userProfileData: any = {
      uid: userId,
      role,
      ...additionalData,
      createdAt: new Date(),
    };

    if (role === 'school_admin') {
      userProfileData.schoolId = null; // Add schoolId as null for school_admin
    } else if (role === 'employer') {
      userProfileData.employerId = null; // Add employerId as null for employer
    }

    await setDoc(doc(db, 'userProfiles', userId), userProfileData);
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Potentially re-throw the error or handle it as needed by the application
    throw error;
  }
};

// Function to get all open job postings
export const getOpenJobPostings = async (): Promise<JobPosting[]> => {
  try {
    const postingsRef = collection(db, 'jobPostings');
    const q = query(postingsRef, where('status', '==', 'open'));
    const querySnapshot = await getDocs(q);

    const postings: JobPosting[] = [];
    querySnapshot.forEach((doc) => {
      postings.push({ id: doc.id, ...doc.data() } as JobPosting);
    });
    return postings;
  } catch (error) {
    console.error('Error fetching open job postings:', error);
    return []; // Return empty array on error
  }
};

// Type for data needed for applyForJob function
export interface ApplyForJobData {
  studentId: string;
  jobPostingId: string;
  employerId: string; // This comes from the JobPosting object
  coverLetter?: string;
  resumeLink?: string; // Optional
}

// Function for a student to apply for a job
export const applyForJob = async (
  applicationData: ApplyForJobData
): Promise<DocumentReference> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated.');
  }
  if (currentUser.uid !== applicationData.studentId) {
    throw new Error('User ID mismatch. Cannot apply on behalf of another user.');
  }

  try {
    // Fetch posting title from the jobPostings collection
    const postingRef = doc(db, 'jobPostings', applicationData.jobPostingId);
    const postingSnap = await getDoc(postingRef);
    if (!postingSnap.exists()) {
      throw new Error('Job posting not found.');
    }
    const postingTitle = postingSnap.data()?.title as string;
    if (!postingTitle) {
        throw new Error('Job posting title not found.');
    }

    const newJobApplication = {
      studentId: applicationData.studentId,
      studentName: currentUser.displayName || 'N/A',
      studentEmail: currentUser.email || 'N/A',
      jobPostingId: applicationData.jobPostingId,
      postingTitle, // Fetched posting title
      employerId: applicationData.employerId, // From job posting data, passed in by client
      applicationDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'pending' as JobApplicationStatus, // Default status
      coverLetter: applicationData.coverLetter || '',
      resumeLink: applicationData.resumeLink || '',
    };

    // Add to jobApplications collection (assuming this collection name)
    const docRef = await addDoc(collection(db, 'jobApplications'), newJobApplication);
    return docRef;
  } catch (error) {
    console.error('Error applying for job:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// --- Job Application Specific Types and Functions ---

// Interface for JobApplication
export type JobApplicationStatus =
  | 'pending'
  | 'shortlisted'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'declined'; // Student can decline an offer

export interface JobApplication {
  id: string; // Document ID
  studentId: string; // UID of the student
  studentName: string;
  studentEmail: string;
  jobPostingId: string;
  postingTitle: string; // Denormalized posting title
  employerId: string; // Denormalized employer ID
  applicationDate: Timestamp;
  status: JobApplicationStatus;
  resumeLink?: string; // Optional link to a resume stored elsewhere
  coverLetter?: string; // Optional
  updatedAt: Timestamp;
}

// Type for data needed to create a job application (students will do this)
// For this subtask, we are primarily concerned with reading and updating status by employers.
export type JobApplicationData = Omit<JobApplication, 'id' | 'updatedAt' | 'applicationDate'>;

// Function to get applications for a specific job posting
export const getApplicationsForJobPosting = async (jobPostingId: string): Promise<JobApplication[]> => {
  try {
    const appsRef = collection(db, 'jobApplications');
    const q = query(appsRef, where('jobPostingId', '==', jobPostingId));
    const querySnapshot = await getDocs(q);

    const applications: JobApplication[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as JobApplication);
    });
    return applications;
  } catch (error) {
    console.error(`Error fetching applications for job posting ${jobPostingId}:`, error);
    return []; // Return empty array on error
  }
};

// Function to update the status of a job application
export const updateJobApplicationStatus = async (applicationId: string, newStatus: JobApplicationStatus): Promise<void> => {
  try {
    const appRef = doc(db, 'jobApplications', applicationId);
    await updateDoc(appRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating status for job application ${applicationId}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Interface for JobPosting
export type JobPostingStatus = 'open' | 'closed' | 'draft';
export type JobPostingType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Temporary';

export interface JobPosting {
  id: string; // Document ID
  title: string;
  description: string;
  requirements: string;
  employerId: string; // ID from employers collection
  companyName: string; // Denormalized company name
  type: JobPostingType;
  location: string;
  status: JobPostingStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // UID of the employer user
}

// Type for data needed to create a job posting
export type JobPostingData = Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

// Function to add a new job posting
export const addJobPosting = async (
  postingData: JobPostingData,
  employerUserId: string,
): Promise<DocumentReference> => {
  try {
    const newPosting = {
      ...postingData,
      createdBy: employerUserId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'jobPostings'), newPosting);
    return docRef;
  } catch (error) {
    console.error('Error adding job posting:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Function to get job postings for an employer
export const getJobPostingsForEmployer = async (employerId: string): Promise<JobPosting[]> => {
  try {
    const postingsRef = collection(db, 'jobPostings');
    const q = query(postingsRef, where('employerId', '==', employerId));
    const querySnapshot = await getDocs(q);

    const postings: JobPosting[] = [];
    querySnapshot.forEach((doc) => {
      postings.push({ id: doc.id, ...doc.data() } as JobPosting);
    });
    return postings;
  } catch (error) {
    console.error('Error fetching job postings for employer:', error);
    return []; // Return empty array on error
  }
};

// Helper function to get employerId for an employer user
export const getEmployerIdForUser = async (userId: string): Promise<string | null> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (userProfileSnap.exists()) {
      const userData = userProfileSnap.data();
      return userData?.employerId || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching employer ID for user ${userId}:`, error);
    throw error;
  }
};

// Helper function to get schoolId for a school_admin
export const getSchoolIdForAdmin = async (userId: string): Promise<string | null> => {
  try {
    const userProfileRef = doc(db, 'userProfiles', userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (userProfileSnap.exists()) {
      const userData = userProfileSnap.data();
      return userData?.schoolId || null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching school ID for user ${userId}:`, error);
    throw error;
  }
};

// Interface for InternshipProgram
export interface InternshipProgram {
  id: string; // Document ID
  title: string;
  description: string;
  requirements: string;
  schoolId: string;
  schoolName: string; // Denormalized school name
  status: 'open' | 'closed' | 'draft';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // UID of the school_admin
}

// Type for data needed to create an internship program
export type InternshipProgramData = Omit<InternshipProgram, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

// Function to add a new internship program
export const addInternshipProgram = async (
  programData: InternshipProgramData,
  adminUserId: string,
): Promise<DocumentReference> => {
  try {
    const newProgram = {
      ...programData,
      createdBy: adminUserId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, 'internshipPrograms'), newProgram);
    return docRef;
  } catch (error) {
    console.error('Error adding internship program:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Function to get internship programs for a school
export const getInternshipProgramsForSchool = async (schoolId: string): Promise<InternshipProgram[]> => {
  try {
    const programsRef = collection(db, 'internshipPrograms');
    const q = query(programsRef, where('schoolId', '==', schoolId));
    const querySnapshot = await getDocs(q);

    const programs: InternshipProgram[] = [];
    querySnapshot.forEach((doc) => {
      programs.push({ id: doc.id, ...doc.data() } as InternshipProgram);
    });
    return programs;
  } catch (error) {
    console.error('Error fetching internship programs for school:', error);
    return []; // Return empty array on error
  }
};

// Interface for InternshipApplication
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export interface InternshipApplication {
  id: string; // Document ID
  studentId: string; // UID of the student
  studentName: string;
  studentEmail: string;
  internshipProgramId: string;
  programTitle: string; // Denormalized program title
  schoolId: string; // Denormalized school ID for easier querying by school admins
  applicationDate: Timestamp;
  status: ApplicationStatus;
  coverLetter?: string; // Optional
  updatedAt: Timestamp;
}

// Type for data needed to create an internship application (students will do this)
// For this subtask, we are primarily concerned with reading and updating status.
export type InternshipApplicationData = Omit<InternshipApplication, 'id' | 'updatedAt' | 'applicationDate'>;


// Function to get applications for a specific internship program
export const getApplicationsForProgram = async (programId: string): Promise<InternshipApplication[]> => {
  try {
    const appsRef = collection(db, 'internshipApplications');
    const q = query(appsRef, where('internshipProgramId', '==', programId));
    const querySnapshot = await getDocs(q);

    const applications: InternshipApplication[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as InternshipApplication);
    });
    return applications;
  } catch (error) {
    console.error(`Error fetching applications for program ${programId}:`, error);
    return []; // Return empty array on error
  }
};

// Function to update the status of an internship application
export const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus): Promise<void> => {
  try {
    const appRef = doc(db, 'internshipApplications', applicationId);
    await updateDoc(appRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error(`Error updating status for application ${applicationId}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Function to get all open internship programs
export const getOpenInternshipPrograms = async (): Promise<InternshipProgram[]> => {
  try {
    const programsRef = collection(db, 'internshipPrograms');
    const q = query(programsRef, where('status', '==', 'open'));
    const querySnapshot = await getDocs(q);

    const programs: InternshipProgram[] = [];
    querySnapshot.forEach((doc) => {
      programs.push({ id: doc.id, ...doc.data() } as InternshipProgram);
    });
    return programs;
  } catch (error) {
    console.error('Error fetching open internship programs:', error);
    return []; // Return empty array on error
  }
};

// Type for data needed for applyForInternship function
export interface ApplyForInternshipData {
  studentId: string;
  internshipProgramId: string;
  schoolId: string; // This comes from the InternshipProgram object
  coverLetter?: string;
}

// Function for a student to apply for an internship
export const applyForInternship = async (
  applicationData: ApplyForInternshipData
): Promise<DocumentReference> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated.');
  }
  if (currentUser.uid !== applicationData.studentId) {
    throw new Error('User ID mismatch. Cannot apply on behalf of another user.');
  }

  try {
    // Fetch program title from the internshipPrograms collection
    const programRef = doc(db, 'internshipPrograms', applicationData.internshipProgramId);
    const programSnap = await getDoc(programRef);
    if (!programSnap.exists()) {
      throw new Error('Internship program not found.');
    }
    const programTitle = programSnap.data()?.title as string;
    if (!programTitle) {
        throw new Error('Internship program title not found.');
    }

    // School ID is already part of applicationData, taken from the program object by the client

    const newApplication = {
      studentId: applicationData.studentId,
      studentName: currentUser.displayName || 'N/A', // Fallback if displayName is not set
      studentEmail: currentUser.email || 'N/A',     // Fallback if email is not set
      internshipProgramId: applicationData.internshipProgramId,
      programTitle, // Fetched program title
      schoolId: applicationData.schoolId, // From program data, passed in by client
      applicationDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'pending' as ApplicationStatus,
      coverLetter: applicationData.coverLetter || '',
    };

    const docRef = await addDoc(collection(db, 'internshipApplications'), newApplication);
    return docRef;
  } catch (error) {
    console.error('Error applying for internship:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

export const updateSchoolProfile = async (
  userId: string,
  schoolId: string,
  schoolData: { name: string; address: string; contactEmail: string; phone: string; website: string; logoUrl?: string; description?: string }
): Promise<void> => {
  try {
    const schoolRef = doc(db, 'schools', schoolId);
    await setDoc(schoolRef, schoolData, { merge: true });
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, { schoolId: schoolId, schoolName: schoolData.name });
  } catch (error) {
    console.error(`Error updating school profile for schoolId ${schoolId}:`, error);
    throw error;
  }
};

export const updateEmployerProfile = async (
  userId: string,
  employerId: string,
  employerData: { companyName: string; address: string; contactEmail: string; phone: string; website: string; logoUrl?: string; description?: string }
): Promise<void> => {
  try {
    const employerRef = doc(db, 'employers', employerId);
    await setDoc(employerRef, employerData, { merge: true });
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, { employerId: employerId, companyName: employerData.companyName });
  } catch (error) {
    console.error(`Error updating employer profile for employerId ${employerId}:`, error);
    throw error;
  }
};

export { app, auth, db }; // Export db
