import { create } from "zustand";
import { applyTheme, getStoredTheme, THEME_KEY } from "../lib/theme";
import type { ThemeMode } from "../lib/theme";
import type { Case, Patient, Report, Role, User } from "../types";
import { firebaseDB } from "../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

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

const mapWithId = <T extends { id: string }>(snapshot: QueryDocumentSnapshot<DocumentData>): T => {
  const data = snapshot.data() as Partial<T> & { id?: string };
  return { ...(data as T), id: data.id ?? snapshot.id };
};

const mapUser = (snapshot: QueryDocumentSnapshot<DocumentData>): User => {
  return mapWithId<User>(snapshot);
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

  refreshFirestoreState();

  return {
    theme: initialTheme,
    setTheme: (mode) => {
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
    login: async (email, password) => {
      try {
        const querySnapshot = await getDocs(
          query(collection(firebaseDB, "users"), where("email", "==", email)),
        );
        if (querySnapshot.empty) {
          return false;
        }
        const user = mapUser(querySnapshot.docs[0]);
        if (user.password !== password) {
          return false;
        }
        set({ authUser: user });
        return true;
      } catch (error) {
        console.error("Login failed", error);
        return false;
      }
    },
    logout: () => {
      set({ authUser: null });
    },
    signup: async (name, email, role, password) => {
      const nextUser: User = {
        id: `user-${crypto.randomUUID().slice(0, 5)}`,
        name,
        email,
        role,
        password,
      };
      set((state) => ({ users: [nextUser, ...state.users] }));
      try {
        await setDoc(doc(firebaseDB, "users", nextUser.id), {
          ...nextUser,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to save user to Firestore", error);
      }
    },
    addPatient: (patient) => {
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
    addCase: (payload) => {
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
    updateCase: (caseId, patch) => {
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
    addReport: (report) => {
      const persistedReport: Report = { ...report, updatedAt: new Date().toISOString() };
      set((state) => {
        const nextReports = state.reports.filter((item) => item.caseId !== report.caseId);
        return { reports: [persistedReport, ...nextReports] };
      });
      setDoc(doc(firebaseDB, "reports", `report-${report.caseId}`), persistedReport).catch((error) =>
        console.error("Failed to save report", error),
      );
    },
    updateUserRole: (userId, role) => {
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? { ...user, role } : user)),
      }));
      updateDoc(doc(firebaseDB, "users", userId), { role }).catch((error) =>
        console.error("Failed to update user role", error),
      );
    },
  };
});
