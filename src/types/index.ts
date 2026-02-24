export type UserRole = "owner" | "admin" | "clinician" | "assistant" | "readOnly";
export type UserStatus = "active" | "disabled";
export type ProfileStatus = "active" | "archived";
export type AssessmentStatus = "draft" | "final";
export type AssessmentType = "posture" | "movement" | "treadmill" | "msk";
export type ProgramAssignmentStatus = "active" | "completed" | "paused";

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface OrganisationSettings {
  dateFormat: string;
  measurementSystem: "metric" | "imperial";
  mode: "clinical" | "group";
  displayNormativeData: boolean;
}

export interface Organisation {
  id: string;
  name: string;
  phone: string;
  contactEmail: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  logoUrl?: string;
  createdAt: string | FirestoreTimestamp;
  createdBy: string;
  settings: OrganisationSettings;
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  allowedGroupIds: string[];
  createdBy: string;
  createdAt: string | FirestoreTimestamp;
  expiresAt: string | FirestoreTimestamp;
  status: "pending" | "accepted" | "revoked";
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
  allowedGroupIds: string[]; // or ["*"] for all
  status: UserStatus;
  createdAt: string | FirestoreTimestamp;
  updatedAt: string | FirestoreTimestamp;
  lastLoginAt?: string | FirestoreTimestamp;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string | FirestoreTimestamp;
  createdBy: string;
}

export interface Group {
  id: string;
  name: string;
  categoryId: string;
  assignedUserIds: string[];
  createdAt: string | FirestoreTimestamp;
  createdBy: string;
  profileCount: number;
}

export interface ProfileSummary {
  lastAssessmentAt: string | FirestoreTimestamp | null;
  lastAssessmentType: AssessmentType | null;
  latestScores: {
    postureScore: number;
    riskScore: number;
  };
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string | FirestoreTimestamp | null;
  heightCm: number;
  weightKg: number;
  sex: "M" | "F" | "Other";
  categoryId: string;
  groupId: string;
  assignedClinicianIds: string[];
  status: ProfileStatus;
  createdAt: string | FirestoreTimestamp;
  createdBy: string;
  updatedAt: string | FirestoreTimestamp;
  summary: ProfileSummary;
}

export interface AssessmentMedia {
  photos: Array<{ view: string; url: string; path: string }>;
  videos: Array<{ angle: string; url: string; path: string }>;
  frames: Array<{ url: string; path: string }>;
}

export interface AssessmentAnnotations {
  landmarks: {
    front: Array<{ id: string; x: number; y: number }>;
    side: Array<{ id: string; x: number; y: number }>;
  };
  lines: any[];
  angles: any[];
}

export interface AssessmentMetrics {
  shoulderTiltDeg?: number;
  pelvicTiltDeg?: number;
  kneeValgusDeg?: number;
  painScore?: number;
  [key: string]: any;
}

export interface Assessment {
  id: string;
  profileId: string;
  type: AssessmentType;
  groupId: string; // denormalized
  categoryId: string; // denormalized
  createdBy: string;
  createdAt: string | FirestoreTimestamp;
  updatedAt: string | FirestoreTimestamp;
  status: AssessmentStatus;
  notes: string;
  media: AssessmentMedia;
  annotations: AssessmentAnnotations;
  metricsSummary: AssessmentMetrics;
}

export interface Report {
  id: string;
  profileId: string;
  createdBy: string;
  createdAt: string | FirestoreTimestamp;
  templateId: string | null;
  assessmentIds: string[];
  summaryText: string;
  recommendations: string;
  pdf: {
    url: string;
    path: string;
  };
  share: {
    enabled: boolean;
    token: string | null;
    expiresAt: string | FirestoreTimestamp | null;
  };
}

export interface ProgramItem {
  exerciseId: string;
  sets: number;
  reps: number;
  restSec: number;
  notes: string;
}

export interface Program {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string | FirestoreTimestamp;
  updatedAt: string | FirestoreTimestamp;
  items: ProgramItem[];
  tags: string[];
}

export interface ProgramAssignment {
  id: string;
  programId: string;
  profileId: string;
  assignedBy: string;
  assignedAt: string | FirestoreTimestamp;
  status: ProgramAssignmentStatus;
  progress: {
    completedItems: number;
    lastCompletedAt: string | FirestoreTimestamp | null;
  };
}

export interface Template {
  id: string;
  name: string;
  type: "report" | "assessment";
  content: any;
  createdAt: string | FirestoreTimestamp;
  createdBy: string;
}

export interface Education {
  id: string;
  title: string;
  content: string;
  url?: string;
  category: string;
  joint?: string;
  area?: string;
  createdAt: string | FirestoreTimestamp;
  createdBy: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  category: string;
  createdAt: string | FirestoreTimestamp;
  createdBy: string;
}

export interface DashboardGroupStats {
  groupId: string;
  updatedAt: string | FirestoreTimestamp;
  metrics: {
    postureScoreAvg: number;
    kneeValgusAvg: number;
    [key: string]: any;
  };
  byType: {
    [key in AssessmentType]?: {
      count: number;
      lastAt: string | FirestoreTimestamp;
    };
  };
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string | FirestoreTimestamp;
  details: any;
}
