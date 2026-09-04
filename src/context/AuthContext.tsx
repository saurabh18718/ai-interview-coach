import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "../types";
import {
  auth,
  hasRealFirebaseConfig,
  getUserProfile,
  saveUserProfile,
  googleProvider,
  signInWithPopup,
} from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_PROFILE: UserProfile = {
  uid: "usr_alex_chen_demo",
  email: "alex.chen@example.com",
  displayName: "Alex Chen",
  education: "University of California, Berkeley",
  degree: "B.S. Computer Science",
  skills: "TypeScript, React, Node.js, Python, System Design, GraphQL, Redis, Distributed Systems",
  workExperience: "4 years as Full Stack Engineer at Fintech Scale-up; built low-latency transaction processing service handling 25k TPS.",
  currentRole: "Senior Full Stack Engineer",
  targetRole: "Staff Software Engineer",
  experienceLevel: "Senior",
  careerGoals: "Transition into high-scale distributed systems and technical leadership at top-tier tech firms.",
  preferredInterviewType: "System Design",
  targetCompany: "Stripe / Google",
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  useEffect(() => {
    if (auth && hasRealFirebaseConfig) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            const profile = await getUserProfile(fbUser.uid);
            if (profile) {
              setUser(profile);
            } else {
              // New user initial profile - requires onboarding
              const newProfile: UserProfile = {
                uid: fbUser.uid,
                email: fbUser.email || "",
                displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Candidate",
                education: "",
                degree: "",
                skills: "",
                workExperience: "",
                currentRole: "",
                targetRole: "Software Engineer",
                experienceLevel: "Mid-Level",
                careerGoals: "",
                preferredInterviewType: "Technical",
                onboardingCompleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await saveUserProfile(newProfile);
              setUser(newProfile);
            }
            setIsDemoMode(false);
          } catch (e) {
            console.error("Error loading user profile:", e);
          }
        } else {
          // Check if active demo session was explicitly initiated
          const savedDemo = localStorage.getItem("aivm_active_session_uid");
          if (savedDemo && savedDemo.startsWith("usr_alex_chen_demo")) {
            const demoProf = await getUserProfile(savedDemo);
            if (demoProf) {
              setUser(demoProf);
              setIsDemoMode(true);
            } else {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If Firebase Auth is not initialized, check for explicit demo session
      const savedDemo = localStorage.getItem("aivm_active_session_uid");
      if (savedDemo) {
        getUserProfile(savedDemo).then((p) => {
          if (p) {
            setUser(p);
            setIsDemoMode(true);
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (auth && hasRealFirebaseConfig) {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        let p = await getUserProfile(res.user.uid);
        if (!p) {
          p = {
            uid: res.user.uid,
            email: res.user.email || email,
            displayName: res.user.displayName || email.split("@")[0],
            education: "",
            degree: "",
            skills: "",
            workExperience: "",
            currentRole: "",
            targetRole: "Software Engineer",
            experienceLevel: "Mid-Level",
            careerGoals: "",
            preferredInterviewType: "Technical",
            onboardingCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await saveUserProfile(p);
        }
        setUser(p);
        setIsDemoMode(false);
        localStorage.setItem("aivm_active_session_uid", res.user.uid);
      } else {
        const uid = `usr_${email.replace(/[^a-zA-Z0-9]/g, "")}`;
        let p = await getUserProfile(uid);
        if (!p) {
          p = {
            ...DEMO_USER_PROFILE,
            uid,
            email,
            displayName: email.split("@")[0],
            onboardingCompleted: false,
          };
          await saveUserProfile(p);
        }
        setUser(p);
        setIsDemoMode(true);
        localStorage.setItem("aivm_active_session_uid", uid);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      if (auth && hasRealFirebaseConfig) {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        const newProf: UserProfile = {
          uid: res.user.uid,
          email,
          displayName: name || email.split("@")[0],
          education: "",
          degree: "",
          skills: "",
          workExperience: "",
          currentRole: "",
          targetRole: "Software Engineer",
          experienceLevel: "Mid-Level",
          careerGoals: "",
          preferredInterviewType: "Technical",
          onboardingCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveUserProfile(newProf);
        setUser(newProf);
        setIsDemoMode(false);
        localStorage.setItem("aivm_active_session_uid", res.user.uid);
      } else {
        const uid = `usr_${Date.now()}`;
        const newProf: UserProfile = {
          uid,
          email,
          displayName: name || "Candidate",
          education: "",
          degree: "",
          skills: "",
          workExperience: "",
          currentRole: "",
          targetRole: "Software Engineer",
          experienceLevel: "Mid-Level",
          careerGoals: "",
          preferredInterviewType: "Technical",
          onboardingCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveUserProfile(newProf);
        setUser(newProf);
        setIsDemoMode(true);
        localStorage.setItem("aivm_active_session_uid", uid);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error("Google Authentication is currently unavailable.");
    }
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      let p = await getUserProfile(res.user.uid);
      if (!p) {
        p = {
          uid: res.user.uid,
          email: res.user.email || "",
          displayName: res.user.displayName || res.user.email?.split("@")[0] || "Candidate",
          education: "",
          degree: "",
          skills: "",
          workExperience: "",
          currentRole: "",
          targetRole: "Software Engineer",
          experienceLevel: "Mid-Level",
          careerGoals: "",
          preferredInterviewType: "Technical",
          onboardingCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveUserProfile(p);
      }
      setUser(p);
      setIsDemoMode(false);
      localStorage.setItem("aivm_active_session_uid", res.user.uid);
    } finally {
      setLoading(false);
    }
  };

  const signInDemo = async () => {
    setLoading(true);
    try {
      setUser(DEMO_USER_PROFILE);
      setIsDemoMode(true);
      await saveUserProfile(DEMO_USER_PROFILE);
      localStorage.setItem("aivm_active_session_uid", DEMO_USER_PROFILE.uid);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (auth && hasRealFirebaseConfig) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn("Firebase sign out error:", err);
      }
    }
    localStorage.removeItem("aivm_active_session_uid");
    setUser(null);
    setFirebaseUser(null);
    setIsDemoMode(false);
  };

  const resetPassword = async (email: string) => {
    if (auth && hasRealFirebaseConfig) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log(`Simulated password reset email sent to ${email}`);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setUser(updated);
    await saveUserProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isDemoMode,
        signIn,
        signUp,
        signInWithGoogle,
        signInDemo,
        signOut,
        resetPassword,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
