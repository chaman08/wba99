export type Role = "physio" | "admin";

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

export interface MSKData {
  standing: {
    kneeToWall: { left: string; right: string; comments: string };
    footPosture: { left: string; right: string; comments: string };
    singleLegStanding: { left: string; right: string; comments: string };
    lumbarFlexion: { left: string; right: string; comments: string };
    lumbarExtension: { left: string; right: string; comments: string };
    lumbarSideFlexion: { left: string; right: string; comments: string };
    lumbarQuadrant: { left: string; right: string; comments: string };
    shoulderAbduction: { left: string; right: string; comments: string };
    hawkinsKennedy: { left: string; right: string; comments: string };
    obriensTest: { left: string; right: string; comments: string };
    emptyCan: { left: string; right: string; comments: string };
  };
  floor: {
    combinedElevation: { left: string; right: string; comments: string };
  };
  seated: {
    thoracicRotation: { left: string; right: string; comments: string };
    slumpTest: { left: string; right: string; comments: string };
  };
  supine: {
    legLength: { left: string; right: string; comments: string };
    shoulderER: { left: string; right: string; comments: string };
    shoulderIR: { left: string; right: string; comments: string };
    activeKneeExtension: { left: string; right: string; comments: string };
    hipQuadrant: { left: string; right: string; comments: string };
  };
  sideLying: {
    mtpExtension: { left: string; right: string; comments: string };
  };
  prone: {
    hipIR: { left: string; right: string; comments: string };
    hipER: { left: string; right: string; comments: string };
    proneKneeFlexion: { left: string; right: string; comments: string };
    forcedAnklePF: { left: string; right: string; comments: string };
  };
  strength: {
    singleLegBridge: { left: string; right: string; comments: string };
    rcStrength: { left: string; right: string; comments: string };
    plank: string;
    sidePlank: { left: string; right: string; comments: string };
    slhbTest: { left: string; right: string; comments: string };
  };
  history: {
    injury: string;
    pastInjury: string;
    matchesPlayed: string;
    missedMatches: string;
    totalMatches: string;
    medicines: string;
  };
  ybt: {
    lowerLimb: {
      right: { anterior: string; pm: string; pl: string };
      left: { anterior: string; pm: string; pl: string };
    };
    upperLimb: {
      right: { medial: string; sl: string; il: string };
      left: { medial: string; sl: string; il: string };
    };
  };
}

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  physiotherapistId: string;
  expertId: string | null;
  patientId: string;
  createdAt: string;
  updatedAt: string;
  mskSummary: string;
  mskData?: MSKData;
  media: {
    posture: MediaSlot[];
    ground: MediaSlot[];
    treadmill: MediaSlot[];
  };
}

export interface Report {
  caseId: string;
  physiotherapistId: string;
  sections: Record<string, string>;
  status: "Draft" | "Report Ready";
  updatedAt: string;
}
