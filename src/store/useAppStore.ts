import { create } from "zustand";
import { applyTheme, getStoredTheme, THEME_KEY } from "../lib/theme";
import type { ThemeMode } from "../lib/theme";
import type { Case, Patient, Report, Role, User } from "../types";
import { firebaseAuth, firebaseDB } from "../lib/firebase";
import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const parseTimestampString = (value?: string | Timestamp, fallback = ""): string => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return fallback;
};

const ensureMedia = (media?: Partial<Case["media"]>): Case["media"] => ({
  posture: Array.isArray(media?.posture) ? (media?.posture as Case["media"]["posture"]) : [],
  ground: Array.isArray(media?.ground) ? (media?.ground as Case["media"]["ground"]) : [],
  treadmill: Array.isArray(media?.treadmill) ? (media?.treadmill as Case["media"]["treadmill"]) : [],
});

const normalizeRole = (value?: string): Role => {
  if (value === "admin" || value === "expert") return "admin";
  return "physio";
};

const mapUserData = (data: Partial<User>, id: string): User => ({
  id,
  name: data.name ?? "",
  email: data.email ?? "",
  role: normalizeRole(data.role),
  password: data.password ?? "",
  avatar: data.avatar,
});

const mapUser = (snapshot: QueryDocumentSnapshot<DocumentData>): User => mapUserData(snapshot.data() as Partial<User>, snapshot.id);

const mapUserFromDoc = (snapshot: DocumentSnapshot<DocumentData>): User => {
  const data = snapshot.data() as Partial<User> | undefined;
  return mapUserData(data ?? {}, snapshot.id);
};

const mapPatient = (snapshot: QueryDocumentSnapshot<DocumentData>): Patient => {
  const data = snapshot.data() as Partial<Patient>;
  return {
    id: (data.id as string) ?? snapshot.id,
    name: data.name ?? "",
    age: Number(data.age ?? 0),
    lastSession: parseTimestampString(data.lastSession as string | Timestamp, ""),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    physiotherapistId: data.physiotherapistId ?? "",
  };
};

const mapCase = (snapshot: QueryDocumentSnapshot<DocumentData>): Case => {
  const data = snapshot.data() as Partial<Case>;
  return {
    id: (data.id as string) ?? snapshot.id,
    title: data.title ?? "",
    status: (data.status as Case["status"]) ?? "Draft",
    physiotherapistId: data.physiotherapistId ?? "",
    expertId: data.expertId ?? null,
    patientId: data.patientId ?? "",
    createdAt: parseTimestampString(data.createdAt as string | Timestamp, new Date().toISOString()),
    updatedAt: parseTimestampString(data.updatedAt as string | Timestamp, new Date().toISOString()),
    mskSummary: data.mskSummary ?? "",
    mskData: data.mskData,
    media: ensureMedia(data.media),
  };
};

const mapReport = (snapshot: QueryDocumentSnapshot<DocumentData>): Report => {
  const data = snapshot.data() as Partial<Report>;
  return {
    caseId: data.caseId ?? "",
    physiotherapistId: data.physiotherapistId ?? "",
    sections: (data.sections as Record<string, string>) ?? {},
    status: data.status ?? "Draft",
    updatedAt: parseTimestampString(data.updatedAt as string | Timestamp, new Date().toISOString()),
  };
};

export interface AppState {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  users: User[];
  patients: Patient[];
  cases: Case[];
  reports: Report[];
  authUser: User | null;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, role: Role, password: string) => Promise<void>;
  addPatient: (patient: Omit<Patient, "id" | "lastSession" | "physiotherapistId">) => Promise<void>;
  addCase: (payload: Partial<Case> & { title: string; patientId: string }) => Promise<void>;
  updateCase: (caseId: string, patch: Partial<Case>) => Promise<void>;
  addReport: (report: Report) => Promise<void>;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
}

const initialTheme = getStoredTheme();
applyTheme(initialTheme);

const LAST_ACTIVE_KEY = "wba99_last_active";
const MAX_INACTIVE_DAYS = 14;

let unsubscribers: Unsubscribe[] = [];

export const useAppStore = create<AppState>((set, get) => {
  const cleanupListeners = () => {
    unsubscribers.forEach((unsub) => unsub());
    unsubscribers = [];
  };

  const setupListeners = (user: User) => {
    cleanupListeners();

    // Users listener (only for admin)
    if (user.role === "admin") {
      const usersUnsub = onSnapshot(collection(firebaseDB, "users"), (snapshot) => {
        set({ users: snapshot.docs.map(mapUser) });
      });
      unsubscribers.push(usersUnsub);
    }

    // Patients listener - filter by physiotherapistId if not admin
    const patientsQuery = user.role === "admin"
      ? collection(firebaseDB, "patients")
      : query(collection(firebaseDB, "patients"), where("physiotherapistId", "==", user.id));

    const patientsUnsub = onSnapshot(patientsQuery, (snapshot) => {
      set({ patients: snapshot.docs.map(mapPatient) });
    });
    unsubscribers.push(patientsUnsub);

    // Cases listener
    const casesQuery = user.role === "admin"
      ? collection(firebaseDB, "cases")
      : query(collection(firebaseDB, "cases"), where("physiotherapistId", "==", user.id));

    const casesUnsub = onSnapshot(casesQuery, (snapshot) => {
      set({ cases: snapshot.docs.map(mapCase) });
    });
    unsubscribers.push(casesUnsub);

    // Reports listener - filter by physiotherapistId if not admin
    const reportsQuery = user.role === "admin"
      ? collection(firebaseDB, "reports")
      : query(collection(firebaseDB, "reports"), where("physiotherapistId", "==", user.id));

    const reportsUnsub = onSnapshot(reportsQuery, (snapshot) => {
      set({ reports: snapshot.docs.map(mapReport) });
    });
    unsubscribers.push(reportsUnsub);
  };

  const checkInactivity = () => {
    const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
    if (lastActive) {
      const lastActiveDate = new Date(lastActive);
      const diffDays = (new Date().getTime() - lastActiveDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays > MAX_INACTIVE_DAYS) {
        signOut(firebaseAuth).catch(console.error);
        localStorage.removeItem(LAST_ACTIVE_KEY);
        set({ authUser: null });
        cleanupListeners();
        return true;
      }
    }
    localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
    return false;
  };

  onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
    if (firebaseUser) {
      const isInactive = checkInactivity();
      if (isInactive) {
        set({ isLoadingAuth: false });
        return;
      }

      try {
        const userDoc = await getDoc(doc(firebaseDB, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const user = mapUserFromDoc(userDoc);
          set({ authUser: user, isLoadingAuth: false });
          setupListeners(user);
        } else {
          set({ authUser: null, isLoadingAuth: false });
        }
      } catch (error) {
        console.error("Failed to rehydrate auth", error);
        set({ authUser: null, isLoadingAuth: false });
      }
    } else {
      set({ authUser: null, isLoadingAuth: false });
      cleanupListeners();
    }
  });

  return {
    theme: initialTheme,
    setTheme: (mode: ThemeMode) => {
      applyTheme(mode);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(THEME_KEY, mode);
      }
      set({ theme: mode });
    },
    users: [],
    patients: [],
    cases: [],
    reports: [],
    authUser: null,
    isLoadingAuth: true,
    login: async (email: string, password: string) => {
      try {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const userDoc = await getDoc(doc(firebaseDB, "users", credential.user.uid));
        if (!userDoc.exists()) {
          return false;
        }
        const user = mapUserFromDoc(userDoc);
        localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
        set({ authUser: user });
        setupListeners(user);
        return true;
      } catch (error) {
        console.error("Login failed", error);
        return false;
      }
    },
    logout: () => {
      signOut(firebaseAuth).catch((error) => console.error("Failed to sign out", error));
      localStorage.removeItem(LAST_ACTIVE_KEY);
      cleanupListeners();
      set({ authUser: null, patients: [], cases: [], reports: [] });
    },
    signup: async (name: string, email: string, role: Role, password: string) => {
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const nextUser: User = {
          id: credential.user.uid,
          name,
          email,
          role,
          password,
        };
        await setDoc(doc(firebaseDB, "users", nextUser.id), {
          ...nextUser,
          createdAt: new Date().toISOString(),
        });
        // onAuthStateChanged will handle setting the authUser and listeners
      } catch (error) {
        console.error("Failed to save user to Firestore", error);
        throw error;
      }
    },
    addPatient: async (patient: Omit<Patient, "id" | "lastSession" | "physiotherapistId">) => {
      const authUser = get().authUser;
      if (!authUser) throw new Error("Authenticated user required");

      const newPatient: Patient = {
        id: `patient-${crypto.randomUUID().slice(0, 8)}`,
        lastSession: new Date().toISOString(),
        ...patient,
        physiotherapistId: authUser.id,
      };

      try {
        await setDoc(doc(firebaseDB, "patients", newPatient.id), newPatient);
        // Listener will update the state
      } catch (error) {
        console.error("Failed to persist patient", error);
        throw error;
      }
    },
    addCase: async (payload: Partial<Case> & { title: string; patientId: string }) => {
      const authUser = get().authUser;
      if (!authUser) throw new Error("Authenticated user required");

      const now = new Date().toISOString();
      const newCase: Case = {
        id: `case-${crypto.randomUUID().slice(0, 8)}`,
        title: payload.title,
        patientId: payload.patientId,
        physiotherapistId: authUser.id,
        expertId: payload.expertId ?? null,
        status: payload.status ?? "Draft",
        createdAt: now,
        updatedAt: now,
        mskSummary: payload.mskSummary ?? "",
        mskData: payload.mskData,
        media: payload.media ?? {
          posture: [],
          ground: [],
          treadmill: [],
        },
      };

      try {
        await setDoc(doc(firebaseDB, "cases", newCase.id), newCase);
      } catch (error) {
        console.error("Failed to persist case", error);
        throw error;
      }
    },
    updateCase: async (caseId: string, patch: Partial<Case>) => {
      const updatedAt = new Date().toISOString();
      const cleanPatch = { ...patch, updatedAt };
      if (cleanPatch.expertId === undefined) {
        // preserve existing if not in patch, but if we want to CLEAR it, we should pass null
      }

      try {
        await updateDoc(doc(firebaseDB, "cases", caseId), cleanPatch as any);
      } catch (error) {
        console.error("Failed to update case", error);
        throw error;
      }
    },
    addReport: async (report: Report) => {
      const persistedReport: Report = { ...report, updatedAt: new Date().toISOString() };
      try {
        await setDoc(doc(firebaseDB, "reports", `report-${report.caseId}`), persistedReport);
      } catch (error) {
        console.error("Failed to save report", error);
        throw error;
      }
    },
    updateUserRole: async (userId: string, role: Role) => {
      try {
        await updateDoc(doc(firebaseDB, "users", userId), { role });
      } catch (error) {
        console.error("Failed to update user role", error);
        throw error;
      }
    },
  };
});
