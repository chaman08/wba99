export type Role = "physio" | "expert" | "admin";

export type CaseStatus =
  | "Draft"
  | "Submitted"
  | "Assigned"
  | "In Review"
  | "Report Ready"
  | "Completed";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  lastSession: string;
  tags: string[];
  physiotherapistId: string;
}

export interface MediaSlot {
  id: string;
  label: string;
  files: string[];
  required: boolean;
  completed: boolean;
}

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  physiotherapistId: string;
  expertId?: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;
  mskSummary: string;
  media: {
    posture: MediaSlot[];
    ground: MediaSlot[];
    treadmill: MediaSlot[];
  };
}

export interface Report {
  caseId: string;
  sections: Record<string, string>;
  status: "Draft" | "Report Ready";
  updatedAt: string;
}
