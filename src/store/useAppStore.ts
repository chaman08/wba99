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
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
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
    expertId: data.expertId,
    patientId: data.patientId ?? "",
    createdAt: parseTimestampString(data.createdAt as string | Timestamp, new Date().toISOString()),
    updatedAt: parseTimestampString(data.updatedAt as string | Timestamp, new Date().toISOString()),
    mskSummary: data.mskSummary ?? "",
    media: ensureMedia(data.media),
  };
};

const mapReport = (snapshot: QueryDocumentSnapshot<DocumentData>): Report => {
  const data = snapshot.data() as Partial<Report>;
  return {
    caseId: data.caseId ?? "",
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
  addPatient: (patient: Omit<Patient, "id" | "lastSession">) => void;
  addCase: (payload: Partial<Case> & { title: string; patientId: string }) => void;
  updateCase: (caseId: string, patch: Partial<Case>) => void;
  addReport: (report: Report) => void;
  updateUserRole: (userId: string, role: Role) => void;
}

const initialTheme = getStoredTheme();
applyTheme(initialTheme);

const LAST_ACTIVE_KEY = "wba99_last_active";
const MAX_INACTIVE_DAYS = 14;

export const useAppStore = create<AppState>((set, get) => {
  const refreshFirestoreState = async () => {
    try {
      const [usersSnapshot, patientsSnapshot, casesSnapshot, reportsSnapshot] = await Promise.all([
        getDocs(collection(firebaseDB, "users")),
        getDocs(collection(firebaseDB, "patients")),
        getDocs(collection(firebaseDB, "cases")),
        getDocs(collection(firebaseDB, "reports")),
      ]);
      set({
        users: usersSnapshot.docs.map(mapUser),
        patients: patientsSnapshot.docs.map(mapPatient),
        cases: casesSnapshot.docs.map(mapCase),
        reports: reportsSnapshot.docs.map(mapReport),
      });
    } catch (error) {
      console.error("Failed to load Firestore data", error);
    }
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
          set({ authUser: mapUserFromDoc(userDoc), isLoadingAuth: false });
          refreshFirestoreState();
        } else {
          set({ authUser: null, isLoadingAuth: false });
        }
      } catch (error) {
        console.error("Failed to rehydrate auth", error);
        set({ authUser: null, isLoadingAuth: false });
      }
    } else {
      set({ authUser: null, isLoadingAuth: false });
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
    login: async (email, password) => {
      try {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const userDoc = await getDoc(doc(firebaseDB, "users", credential.user.uid));
        if (!userDoc.exists()) {
          return false;
        }
        const user = mapUserFromDoc(userDoc);
        localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
        set({ authUser: user });
        refreshFirestoreState();
        return true;
      } catch (error) {
        console.error("Login failed", error);
        return false;
      }
    },
    logout: () => {
      signOut(firebaseAuth).catch((error) => console.error("Failed to sign out", error));
      localStorage.removeItem(LAST_ACTIVE_KEY);
      set({ authUser: null });
    },
    signup: async (name, email, role, password) => {
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const nextUser: User = {
          id: credential.user.uid,
          name,
          email,
          role,
          password,
        };
        set((state) => ({ users: [nextUser, ...state.users] }));
        await setDoc(doc(firebaseDB, "users", nextUser.id), {
          ...nextUser,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to save user to Firestore", error);
        throw error;
      }
    },
    addPatient: (patient: Omit<Patient, "id" | "lastSession">) => {
      const newPatient: Patient = {
        id: `patient-${crypto.randomUUID().slice(0, 5)}`,
        lastSession: new Date().toISOString().split("T")[0],
        ...patient,
      };
      set((state) => ({ patients: [newPatient, ...state.patients] }));
      setDoc(doc(firebaseDB, "patients", newPatient.id), newPatient).catch((error) =>
        console.error("Failed to persist patient", error),
      );
    },
    addCase: (payload: Partial<Case> & { title: string; patientId: string }) => {
      const now = new Date().toISOString();
      const newCase: Case = {
        id: `case-${crypto.randomUUID().slice(0, 5)}`,
        title: payload.title,
        patientId: payload.patientId,
        physiotherapistId: get().authUser?.id ?? "u-physio",
        expertId: payload.expertId,
        status: "Draft",
        createdAt: now,
        updatedAt: now,
        mskSummary: payload.mskSummary ?? "",
        media: payload.media ?? {
          posture: [],
          ground: [],
          treadmill: [],
        },
      };
      set((state) => ({ cases: [newCase, ...state.cases] }));
      setDoc(doc(firebaseDB, "cases", newCase.id), newCase).catch((error) =>
        console.error("Failed to persist case", error),
      );
    },
    updateCase: (caseId: string, patch: Partial<Case>) => {
      const updatedAt = new Date().toISOString();
      set((state) => ({
        cases: state.cases.map((item) =>
          item.id === caseId ? { ...item, ...patch, updatedAt } : item,
        ),
      }));
      updateDoc(doc(firebaseDB, "cases", caseId), { ...patch, updatedAt }).catch((error) =>
        console.error("Failed to update case", error),
      );
    },
    addReport: (report: Report) => {
      const persistedReport: Report = { ...report, updatedAt: new Date().toISOString() };
      set((state) => {
        const nextReports = state.reports.filter((item) => item.caseId !== report.caseId);
        return { reports: [persistedReport, ...nextReports] };
      });
      setDoc(doc(firebaseDB, "reports", `report-${report.caseId}`), persistedReport).catch((error) =>
        console.error("Failed to save report", error),
      );
    },
    updateUserRole: (userId: string, role: Role) => {
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? { ...user, role } : user)),
      }));
      updateDoc(doc(firebaseDB, "users", userId), { role }).catch((error) =>
        console.error("Failed to update user role", error),
      );
    },
  };
});
