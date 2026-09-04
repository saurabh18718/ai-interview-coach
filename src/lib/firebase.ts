/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  Auth,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
  Firestore,
} from "firebase/firestore";
import { UserProfile, InterviewSession, BookmarkItem } from "../types";
import firebaseAppletConfig from "../../firebase-applet-config.json";

const metaEnv = (import.meta as any).env || {};

// Configuration from provisioned Firebase project (firebase-applet-config.json)
const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: firebaseAppletConfig.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseAppletConfig.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseAppletConfig.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseAppletConfig.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseAppletConfig.appId || metaEnv.VITE_FIREBASE_APP_ID,
};

const databaseId = firebaseAppletConfig.firestoreDatabaseId || "(default)";

export const hasRealFirebaseConfig = true;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app, databaseId);

  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
} catch (err) {
  console.warn("Firebase initialization warning:", err);
}

// Test connection as required by firebase skill
async function testFirestoreConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testFirestoreConnection();

export { auth, db, googleProvider, signInWithPopup };

// Online / Offline Status Detection
let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
const onlineListeners = new Set<(online: boolean) => void>();

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isOnline = true;
    onlineListeners.forEach((fn) => fn(true));
    flushPendingSync();
  });
  window.addEventListener("offline", () => {
    isOnline = false;
    onlineListeners.forEach((fn) => fn(false));
  });
}

export function isClientOnline(): boolean {
  return isOnline;
}

export function onOnlineStatusChange(listener: (online: boolean) => void): () => void {
  onlineListeners.add(listener);
  return () => onlineListeners.delete(listener);
}

// Timeout helper: guarantees an operation cannot block UI longer than ms
function withTimeout<T>(promise: Promise<T>, ms = 2500, fallbackValue: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), ms)),
  ]);
}

// Local storage keys for resilient offline & instantaneous UI response
const STORAGE_PREFIX = "aivm_";
const USER_KEY = `${STORAGE_PREFIX}user_profile`;
const SESSIONS_KEY = `${STORAGE_PREFIX}interviews`;
const BOOKMARKS_KEY = `${STORAGE_PREFIX}bookmarks`;
const PENDING_PROFILE_SYNC_KEY = `${STORAGE_PREFIX}pending_profile_sync`;
const PENDING_SESSIONS_SYNC_KEY = `${STORAGE_PREFIX}pending_sessions_sync`;

// 1. Profile operations (NEVER BLOCKS UI)
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  // 1. Update local storage IMMEDIATELY
  try {
    localStorage.setItem(`${USER_KEY}_${profile.uid}`, JSON.stringify(profile));
    // Enqueue for background sync
    localStorage.setItem(PENDING_PROFILE_SYNC_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn("Local storage write error:", err);
  }

  // 2. Perform Firestore write in background with strict timeout
  if (db && hasRealFirebaseConfig) {
    withTimeout(
      (async () => {
        try {
          const userRef = doc(db, "users", profile.uid);
          await setDoc(userRef, profile, { merge: true });
          // If write succeeded, clear pending queue
          localStorage.removeItem(PENDING_PROFILE_SYNC_KEY);
        } catch (e: any) {
          // If offline, it will stay in pending queue and sync automatically when online
          console.warn("Firestore saveUserProfile deferred to sync queue:", e?.message || e);
        }
      })(),
      2500,
      undefined
    ).catch(() => {});
  }

  // Returns immediately so onboarding and profile forms never freeze
  return Promise.resolve();
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // 1. Check local cache first for instant load
  let cachedProfile: UserProfile | null = null;
  try {
    const raw = localStorage.getItem(`${USER_KEY}_${uid}`);
    if (raw) {
      cachedProfile = JSON.parse(raw);
    }
  } catch {
    cachedProfile = null;
  }

  // 2. If we have local cache, return it immediately and sync from Firestore in background
  if (cachedProfile) {
    if (db && hasRealFirebaseConfig && isOnline) {
      // Background revalidation
      withTimeout(
        (async () => {
          try {
            const userRef = doc(db, "users", uid);
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const remoteData = snap.data() as UserProfile;
              localStorage.setItem(`${USER_KEY}_${uid}`, JSON.stringify(remoteData));
            }
          } catch (e: any) {
            // Ignored - cached data is already active
          }
        })(),
        2500,
        undefined
      ).catch(() => {});
    }
    return cachedProfile;
  }

  // 3. If no local cache exists, attempt Firestore with 2500ms timeout
  if (db && hasRealFirebaseConfig && isOnline) {
    try {
      const userRef = doc(db, "users", uid);
      const snap = await withTimeout(getDoc(userRef), 2500, null);
      if (snap && snap.exists()) {
        const data = snap.data() as UserProfile;
        try {
          localStorage.setItem(`${USER_KEY}_${uid}`, JSON.stringify(data));
        } catch {}
        return data;
      }
    } catch (e: any) {
      console.warn("Firestore getUserProfile timeout/offline:", e?.message || e);
    }
  }

  return null;
}

// 2. Interview operations (NEVER BLOCKS UI)
export async function saveInterviewSession(session: InterviewSession): Promise<void> {
  // 1. Update local storage IMMEDIATELY
  const stored = getLocalInterviews(session.userId);
  const index = stored.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    stored[index] = session;
  } else {
    stored.unshift(session);
  }
  try {
    localStorage.setItem(`${SESSIONS_KEY}_${session.userId}`, JSON.stringify(stored));
    // Enqueue to pending sessions sync
    const pendingSessions = getPendingSessions();
    pendingSessions[session.id] = session;
    localStorage.setItem(PENDING_SESSIONS_SYNC_KEY, JSON.stringify(pendingSessions));
  } catch (err) {
    console.warn("Local storage write error:", err);
  }

  // 2. Background Firestore write with timeout
  if (db && hasRealFirebaseConfig) {
    withTimeout(
      (async () => {
        try {
          const ref = doc(db, "interviews", session.id);
          await setDoc(ref, session, { merge: true });
          // Remove from pending on success
          const pending = getPendingSessions();
          delete pending[session.id];
          localStorage.setItem(PENDING_SESSIONS_SYNC_KEY, JSON.stringify(pending));
        } catch (e: any) {
          console.warn("Firestore saveInterviewSession deferred to sync queue:", e?.message || e);
        }
      })(),
      2500,
      undefined
    ).catch(() => {});
  }

  return Promise.resolve();
}

export async function getInterviewSession(sessionId: string, userId: string): Promise<InterviewSession | null> {
  const stored = getLocalInterviews(userId);
  const localMatch = stored.find((s) => s.id === sessionId);

  if (db && hasRealFirebaseConfig && isOnline) {
    try {
      const ref = doc(db, "interviews", sessionId);
      const snap = await withTimeout(getDoc(ref), 2500, null);
      if (snap && snap.exists()) {
        const remoteSession = snap.data() as InterviewSession;
        // Update local cache
        const index = stored.findIndex((s) => s.id === sessionId);
        if (index >= 0) stored[index] = remoteSession;
        else stored.unshift(remoteSession);
        localStorage.setItem(`${SESSIONS_KEY}_${userId}`, JSON.stringify(stored));
        return remoteSession;
      }
    } catch (e: any) {
      console.warn("Firestore getInterviewSession fallback to local:", e?.message || e);
    }
  }

  return localMatch || null;
}

export async function getUserInterviews(userId: string): Promise<InterviewSession[]> {
  const localList = getLocalInterviews(userId);

  // Background or fast fetch
  if (db && hasRealFirebaseConfig && isOnline) {
    try {
      const q = query(
        collection(db, "interviews"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snap = await withTimeout(getDocs(q), 2500, null);
      if (snap && !snap.empty) {
        const list: InterviewSession[] = [];
        snap.forEach((d) => list.push(d.data() as InterviewSession));
        localStorage.setItem(`${SESSIONS_KEY}_${userId}`, JSON.stringify(list));
        return list;
      }
    } catch (e: any) {
      console.warn("Firestore getUserInterviews fallback to local storage:", e?.message || e);
    }
  }

  return localList;
}

export async function deleteInterviewSession(sessionId: string, userId: string): Promise<void> {
  const stored = getLocalInterviews(userId).filter((s) => s.id !== sessionId);
  localStorage.setItem(`${SESSIONS_KEY}_${userId}`, JSON.stringify(stored));

  if (db && hasRealFirebaseConfig) {
    withTimeout(
      (async () => {
        try {
          await deleteDoc(doc(db, "interviews", sessionId));
        } catch (e: any) {
          console.warn("Firestore deleteInterviewSession fallback:", e?.message || e);
        }
      })(),
      2500,
      undefined
    ).catch(() => {});
  }
}

function getLocalInterviews(userId: string): InterviewSession[] {
  try {
    const raw = localStorage.getItem(`${SESSIONS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getPendingSessions(): Record<string, InterviewSession> {
  try {
    const raw = localStorage.getItem(PENDING_SESSIONS_SYNC_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Auto-Sync mechanism: flushes pending changes to Firestore when online
export async function flushPendingSync(): Promise<void> {
  if (!db || !hasRealFirebaseConfig || !isOnline) return;

  // 1. Sync pending profile
  try {
    const rawProfile = localStorage.getItem(PENDING_PROFILE_SYNC_KEY);
    if (rawProfile) {
      const profile = JSON.parse(rawProfile);
      const userRef = doc(db, "users", profile.uid);
      await setDoc(userRef, profile, { merge: true });
      localStorage.removeItem(PENDING_PROFILE_SYNC_KEY);
    }
  } catch (e) {
    console.warn("Flush pending profile sync error:", e);
  }

  // 2. Sync pending sessions
  try {
    const pendingSessions = getPendingSessions();
    const sessionIds = Object.keys(pendingSessions);
    for (const sid of sessionIds) {
      const session = pendingSessions[sid];
      const ref = doc(db, "interviews", session.id);
      await setDoc(ref, session, { merge: true });
      delete pendingSessions[sid];
    }
    localStorage.setItem(PENDING_SESSIONS_SYNC_KEY, JSON.stringify(pendingSessions));
  } catch (e) {
    console.warn("Flush pending sessions sync error:", e);
  }
}

// Trigger initial sync on startup
if (typeof window !== "undefined") {
  setTimeout(() => flushPendingSync(), 1500);
}

// 3. Bookmarks operations
export async function toggleBookmark(
  userId: string,
  itemType: "book" | "blog" | "topic",
  itemId: string,
  title: string,
  subtitle?: string
): Promise<boolean> {
  const bookmarks = getUserBookmarks(userId);
  const existingIndex = bookmarks.findIndex((b) => b.itemId === itemId && b.itemType === itemType);

  if (existingIndex >= 0) {
    bookmarks.splice(existingIndex, 1);
    localStorage.setItem(`${BOOKMARKS_KEY}_${userId}`, JSON.stringify(bookmarks));
    return false; // unbookmarked
  } else {
    const newBookmark: BookmarkItem = {
      id: `bm_${Date.now()}`,
      userId,
      itemType,
      itemId,
      title,
      subtitle,
      createdAt: new Date().toISOString(),
    };
    bookmarks.unshift(newBookmark);
    localStorage.setItem(`${BOOKMARKS_KEY}_${userId}`, JSON.stringify(bookmarks));
    return true; // bookmarked
  }
}

export function getUserBookmarks(userId: string): BookmarkItem[] {
  try {
    const raw = localStorage.getItem(`${BOOKMARKS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isItemBookmarked(userId: string, itemType: "book" | "blog" | "topic", itemId: string): boolean {
  const bookmarks = getUserBookmarks(userId);
  return bookmarks.some((b) => b.itemType === itemType && b.itemId === itemId);
}
