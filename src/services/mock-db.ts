import type { Case, MediaSlot, Patient, Report, User } from "../types";

const STORAGE_KEY = "wba99-mock-db";

const createMediaSlots = (prefix: string, count: number, required: boolean): MediaSlot[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    label: `${prefix} ${index + 1}`,
    files: [],
    required,
    completed: false,
  }));

const defaultUsers: User[] = [
  { id: "u-physio", name: "Ania Brooks", email: "physio@demo.com", role: "physio", password: "demo" },
  { id: "u-expert", name: "Theo Kim", email: "expert@demo.com", role: "expert", password: "demo" },
  { id: "u-admin", name: "Meredith Lane", email: "admin@demo.com", role: "admin", password: "demo" },
];

const defaultPatients: Patient[] = [
  {
    id: "p-001",
    name: "Julian Rivera",
    age: 29,
    lastSession: "2025-12-05",
    tags: ["Athlete", "Posture"],
    physiotherapistId: "u-physio",
  },
  {
    id: "p-002",
    name: "Mara Lewis",
    age: 42,
    lastSession: "2026-01-15",
    tags: ["Knee", "Office Worker"],
    physiotherapistId: "u-physio",
  },
];

const defaultCases: Case[] = [
  {
    id: "case-101",
    title: "Right hip sprain follow-up",
    status: "Submitted",
    physiotherapistId: "u-physio",
    patientId: "p-001",
    createdAt: "2026-01-28",
    updatedAt: "2026-02-10",
    mskSummary: "Glute strength deficit with mild adduction tone.",
    expertId: "u-expert",
    media: {
      posture: createMediaSlots("Posture", 4, true),
      ground: createMediaSlots("Ground", 4, true),
      treadmill: createMediaSlots("Treadmill", 4, false),
    },
  },
  {
    id: "case-102",
    title: "ACL return-to-run",
    status: "Assigned",
    physiotherapistId: "u-physio",
    patientId: "p-002",
    createdAt: "2026-01-18",
    updatedAt: "2026-02-08",
    mskSummary: "Quad inhibition with slight valgus.",
    expertId: "u-expert",
    media: {
      posture: createMediaSlots("Posture", 4, true),
      ground: createMediaSlots("Ground", 4, true),
      treadmill: createMediaSlots("Treadmill", 4, false),
    },
  },
];

const defaultReports: Report[] = [
  {
    caseId: "case-102",
    status: "Draft",
    updatedAt: "2026-02-10",
    sections: {
      observations: "Patient demonstrates full ROM on open chain tests.",
      posture: "Pelvic drop with mild lumbar lordosis.",
      gait: "Mild right knee valgus during mid stance.",
      limitations: "Unable to sustain treadmill interval longer than 2 minutes.",
      interpretation: "Loading tolerance improving but still sensitive to fatigue.",
      recommendations: "Continue tempo runs with posterior chain emphasis.",
      precautions: "Avoid rapid direction change for 1 week.",
    },
  },
];

interface MockDB {
  users: User[];
  patients: Patient[];
  cases: Case[];
  reports: Report[];
}

const getDefaultDB = (): MockDB => ({
  users: defaultUsers,
  patients: defaultPatients,
  cases: defaultCases,
  reports: defaultReports,
});

const readStorage = (): MockDB => {
  if (typeof localStorage === "undefined") return getDefaultDB();
  const persisted = localStorage.getItem(STORAGE_KEY);
  if (!persisted) {
    const baseline = getDefaultDB();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(baseline));
    return baseline;
  }
  try {
    return JSON.parse(persisted);
  } catch (error) {
    const fallback = getDefaultDB();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

const writeStorage = (payload: MockDB) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const getMockDB = (): MockDB => readStorage();

export const saveMockDB = (partial: Partial<MockDB>) => {
  const current = readStorage();
  const updated: MockDB = {
    ...current,
    ...partial,
  };
  writeStorage(updated);
  return updated;
};
