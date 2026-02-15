import { create } from "zustand";
import { applyTheme, getStoredTheme, THEME_KEY } from "../lib/theme";
import type { ThemeMode } from "../lib/theme";
import type { Case, Patient, Report, Role, User } from "../types";
import { getMockDB, saveMockDB } from "../services/mock-db";

export interface AppState {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  users: User[];
  patients: Patient[];
  cases: Case[];
  reports: Report[];
  authUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  signup: (name: string, email: string, role: Role, password: string) => void;
  addPatient: (patient: Omit<Patient, "id" | "lastSession">) => void;
  addCase: (payload: Partial<Case> & { title: string; patientId: string }) => void;
  updateCase: (caseId: string, patch: Partial<Case>) => void;
  addReport: (report: Report) => void;
  updateUserRole: (userId: string, role: Role) => void;
}

const initialTheme = getStoredTheme();
applyTheme(initialTheme);

const initialDB = getMockDB();

export const useAppStore = create<AppState>((set, get) => {
  const persist = () => {
    const { users, patients, cases, reports } = get();
    saveMockDB({ users, patients, cases, reports });
  };

  return {
    theme: initialTheme,
    setTheme: (mode) => {
      applyTheme(mode);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(THEME_KEY, mode);
      }
      set({ theme: mode });
    },
    users: initialDB.users,
    patients: initialDB.patients,
    cases: initialDB.cases,
    reports: initialDB.reports,
    authUser: null,
    login: (email, password) => {
      const match = get().users.find((user) => user.email === email);
      if (match && match.password === password) {
        set({ authUser: match });
        return true;
      }
      return false;
    },
    logout: () => {
      set({ authUser: null });
    },
    signup: (name, email, role, password) => {
      const nextUser: User = {
        id: `user-${crypto.randomUUID().slice(0, 5)}`,
        name,
        email,
        role,
        password,
      };
      set((state) => ({ users: [nextUser, ...state.users] }));
      persist();
    },
    addPatient: (patient) => {
      const newPatient: Patient = {
        id: `patient-${crypto.randomUUID().slice(0, 5)}`,
        lastSession: new Date().toISOString().split("T")[0],
        ...patient,
      };
      set((state) => ({ patients: [newPatient, ...state.patients] }));
      persist();
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
      persist();
    },
    updateCase: (caseId, patch) => {
      set((state) => ({
        cases: state.cases.map((item) =>
          item.id === caseId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
        ),
      }));
      persist();
    },
    addReport: (report) => {
      set((state) => {
        const nextReports = state.reports.filter((item) => item.caseId !== report.caseId);
        return { reports: [{ ...report, updatedAt: new Date().toISOString() }, ...nextReports] };
      });
      persist();
    },
    updateUserRole: (userId, role) => {
      set((state) => ({
        users: state.users.map((user) => (user.id === userId ? { ...user, role } : user)),
      }));
      persist();
    },
  };
});
