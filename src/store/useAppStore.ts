import { create } from "zustand";
import { applyTheme, getStoredTheme, THEME_KEY } from "../lib/theme";
import type { ThemeMode } from "../lib/theme";
import type {
  Assessment,
  Profile,
  Report,
  UserRole,
  User,
  Organisation,
  Category,
  Group,
  Program,
  ProgramAssignment,
  DashboardGroupStats,
} from "../types";
import { firebaseAuth, firebaseDB, firebaseFunctions, firebaseStorage } from "../lib/firebase";
import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  query,
  setDoc,
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
import { httpsCallable } from "firebase/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


const normalizeRole = (value?: string): UserRole => {
  if (["owner", "admin", "clinician", "assistant", "readOnly"].includes(value as any)) {
    return value as UserRole;
  }
  return "clinician";
};

const CENTRAL_ORG_ID = "wba99";

const mapUser = (snapshot: QueryDocumentSnapshot<DocumentData>): User => {
  const data = snapshot.data();
  return {
    uid: snapshot.id,
    orgId: data.orgId ?? CENTRAL_ORG_ID,
    name: data.name ?? "",
    email: data.email ?? "",
    role: normalizeRole(data.role),
    isAdmin: !!data.isAdmin,
    allowedGroupIds: data.allowedGroupIds ?? [],
    status: data.status ?? "active",
    createdBy: data.createdBy ?? snapshot.id,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastLoginAt: data.lastLoginAt,
  };
};

const mapOrganisation = (snapshot: DocumentSnapshot<DocumentData>): Organisation => {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    name: data.name ?? "",
    phone: data.phone ?? "",
    contactEmail: data.contactEmail ?? "",
    address1: data.address1 ?? "",
    address2: data.address2,
    city: data.city ?? "",
    state: data.state ?? "",
    postalCode: data.postalCode ?? "",
    country: data.country ?? "",
    logoUrl: data.logoUrl,
    createdAt: data.createdAt,
    createdBy: data.createdBy ?? "",
    settings: {
      dateFormat: data.settings?.dateFormat ?? "DD/MM/YYYY",
      measurementSystem: data.settings?.measurementSystem ?? "metric",
      mode: data.settings?.mode ?? "clinical",
      displayNormativeData: data.settings?.displayNormativeData ?? true,
    },
  };
};

const mapGroup = (snapshot: QueryDocumentSnapshot<DocumentData>): Group => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name ?? "",
    categoryId: data.categoryId ?? "",
    assignedUserIds: data.assignedUserIds ?? [],
    createdAt: data.createdAt,
    createdBy: data.createdBy ?? "",
    profileCount: data.profileCount ?? 0,
  };
};

const mapCategory = (snapshot: QueryDocumentSnapshot<DocumentData>): Category => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name ?? "",
    description: data.description,
    createdAt: data.createdAt,
    createdBy: data.createdBy ?? "",
  };
};

const mapProfile = (snapshot: QueryDocumentSnapshot<DocumentData>): Profile => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    dob: data.dob ?? null,
    heightCm: data.heightCm ?? 0,
    weightKg: data.weightKg ?? 0,
    sex: data.sex ?? "M",
    categoryId: data.categoryId ?? "",
    groupId: data.groupId ?? "",
    assignedClinicianIds: data.assignedClinicianIds ?? [],
    status: data.status ?? "active",
    createdAt: data.createdAt,
    createdBy: data.createdBy ?? "",
    updatedAt: data.updatedAt,
    summary: {
      lastAssessmentAt: data.summary?.lastAssessmentAt ?? null,
      lastAssessmentType: data.summary?.lastAssessmentType ?? null,
      latestScores: {
        postureScore: data.summary?.latestScores?.postureScore ?? 0,
        riskScore: data.summary?.latestScores?.riskScore ?? 0,
      },
    },
  };
};

const mapAssessment = (snapshot: QueryDocumentSnapshot<DocumentData>): Assessment => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    profileId: data.profileId ?? "",
    type: data.type ?? "posture",
    groupId: data.groupId ?? "",
    categoryId: data.categoryId ?? "",
    createdBy: data.createdBy ?? "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    status: data.status ?? "draft",
    notes: data.notes ?? "",
    media: data.media ?? { photos: [], videos: [], frames: [] },
    annotations: data.annotations ?? { landmarks: { front: [], side: [] }, lines: [], angles: [] },
    metricsSummary: data.metricsSummary ?? {},
    title: data.title ?? "New Assessment",
    expertId: data.expertId,
    mskSummary: data.mskSummary,
  };
};

const mapReport = (snapshot: QueryDocumentSnapshot<DocumentData>): Report => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    profileId: data.profileId ?? "",
    createdBy: data.createdBy ?? "",
    createdAt: data.createdAt,
    templateId: data.templateId ?? null,
    assessmentIds: data.assessmentIds ?? [],
    summaryText: data.summaryText ?? "",
    recommendations: data.recommendations ?? "",
    pdf: data.pdf ?? { url: "", path: "" },
    share: data.share ?? { enabled: false, token: null, expiresAt: null },
  };
};

const mapProgram = (snapshot: QueryDocumentSnapshot<DocumentData>): Program => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name ?? "",
    createdBy: data.createdBy ?? "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    items: data.items ?? [],
    tags: data.tags ?? [],
  };
};

const mapAssignment = (snapshot: QueryDocumentSnapshot<DocumentData>): ProgramAssignment => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    programId: data.programId ?? "",
    profileId: data.profileId ?? "",
    assignedBy: data.assignedBy ?? "",
    assignedAt: data.assignedAt,
    status: data.status ?? "active",
    progress: data.progress ?? { completedItems: 0, lastCompletedAt: null },
  };
};

export interface AppState {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  organisation: Organisation | null;
  organisations: Organisation[];
  users: User[];
  profiles: Profile[];
  assessments: Assessment[];
  reports: Report[];
  categories: Category[];
  groups: Group[];
  programs: Program[];
  programAssignments: ProgramAssignment[];
  dashboardStats: DashboardGroupStats[];
  authUser: User | null;
  isLoadingAuth: boolean;
  authError: string | null;
  isCreatingOrg: boolean;
  isProvisioning: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createOrganisation: (orgName: string, name: string, email: string, password: string) => Promise<void>;
  createInvite: (email: string, inviteRole: UserRole, allowedGroupIds?: string[]) => Promise<string>;
  acceptInvite: (inviteId: string, orgId: string, name: string, password: string) => Promise<void>;
  uploadFile: (path: string, file: File) => Promise<string>;
  addProfile: (profile: Omit<Profile, "id" | "createdAt" | "updatedAt" | "createdBy">) => Promise<void>;
  addAssessment: (assessment: Omit<Assessment, "id" | "createdAt" | "updatedAt" | "createdBy" | "title"> & { title?: string }) => Promise<void>;
  updateAssessment: (assessmentId: string, patch: Partial<Assessment>) => Promise<void>;
  addReport: (report: Report) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateOrganisation: (details: Partial<Organisation>) => Promise<void>;
}

const initialTheme = getStoredTheme();
applyTheme(initialTheme);

const CREATING_ORG_KEY = "wba99_creating_org";
const LAST_ACTIVE_KEY = "wba99_last_active";
const MAX_INACTIVE_DAYS = 14;

let userUnsub: Unsubscribe | null = null;
let unsubscribers: Unsubscribe[] = [];

export const useAppStore = create<AppState>((set, get) => {
  const cleanupListeners = () => {
    unsubscribers.forEach((unsub) => unsub());
    unsubscribers = [];
  };

  const setupListeners = (user: User, orgId: string) => {
    cleanupListeners();

    const isGlobalAdmin = user.role === "owner" || user.role === "admin";

    const handleError = (collectionName: string, error: any) => {
      console.warn(`[Sync] Error syncing ${collectionName}:`, error.code || error.message);
      if (error.code === 'permission-denied') {
        console.error(`[Sync] Permission denied for ${collectionName}. Check roles/rules.`);
      }
    };

    // Organisation listener (Current context)
    const orgUnsub = onSnapshot(doc(firebaseDB, "orgs", orgId), (snapshot) => {
      set({ organisation: mapOrganisation(snapshot) });
    }, (err) => handleError("organisation", err));
    unsubscribers.push(orgUnsub);

    // Global Orgs listener (for Super Admins to resolve names)
    if (isGlobalAdmin) {
      const allOrgsUnsub = onSnapshot(collection(firebaseDB, "orgs"), (snapshot) => {
        set({ organisations: snapshot.docs.map(mapOrganisation) });
      }, (err) => handleError("all_organisations", err));
      unsubscribers.push(allOrgsUnsub);
    }

    // Users listener - Filtered by orgId for everyone
    const usersQuery = query(collection(firebaseDB, "users"), where("orgId", "==", orgId));
    const usersUnsub = onSnapshot(usersQuery, (snapshot) => {
      set({ users: snapshot.docs.map(mapUser) });
    }, (err) => handleError("users", err));
    unsubscribers.push(usersUnsub);

    // Categories listener
    const categoriesQuery = query(collection(firebaseDB, "categories"), where("orgId", "==", orgId));

    const categoriesUnsub = onSnapshot(categoriesQuery, (snapshot) => {
      set({ categories: snapshot.docs.map(mapCategory) });
    }, (err) => handleError("categories", err));
    unsubscribers.push(categoriesUnsub);

    // Groups listener
    const groupsQuery = query(collection(firebaseDB, "groups"), where("orgId", "==", orgId));

    const groupsUnsub = onSnapshot(groupsQuery, (snapshot) => {
      set({ groups: snapshot.docs.map(mapGroup) });
    }, (err) => handleError("groups", err));
    unsubscribers.push(groupsUnsub);

    // Profiles listener - Global for admins (within their org)
    // Note: Previous logic for clinician assignment might still be needed if clinician isn't global admin
    const profilesQuery = isGlobalAdmin
      ? query(collection(firebaseDB, "profiles"), where("orgId", "==", orgId))
      : query(collection(firebaseDB, "profiles"), where("orgId", "==", orgId), where("assignedClinicianIds", "array-contains", user.uid));

    const profilesUnsub = onSnapshot(profilesQuery, (snapshot: any) => {
      set({ profiles: snapshot.docs.map(mapProfile) });
    }, (err: any) => handleError("profiles", err));
    unsubscribers.push(profilesUnsub);

    // Assessments listener
    const assessmentsQuery = query(collection(firebaseDB, "assessments"), where("orgId", "==", orgId));

    const assessmentsUnsub = onSnapshot(assessmentsQuery, (snapshot) => {
      set({ assessments: snapshot.docs.map(mapAssessment) });
    }, (err) => handleError("assessments", err));
    unsubscribers.push(assessmentsUnsub);

    // Reports listener
    const reportsQuery = query(collection(firebaseDB, "reports"), where("orgId", "==", orgId));

    const reportsUnsub = onSnapshot(reportsQuery, (snapshot) => {
      set({ reports: snapshot.docs.map(mapReport) });
    }, (err) => handleError("reports", err));
    unsubscribers.push(reportsUnsub);

    // Programs listener
    const programsQuery = query(collection(firebaseDB, "programs"), where("orgId", "==", orgId));

    const programsUnsub = onSnapshot(programsQuery, (snapshot) => {
      set({ programs: snapshot.docs.map(mapProgram) });
    }, (err) => handleError("programs", err));
    unsubscribers.push(programsUnsub);

    // Program Assignments listener
    const assignmentsQuery = query(collection(firebaseDB, "programAssignments"), where("orgId", "==", orgId));

    const assignmentsUnsub = onSnapshot(assignmentsQuery, (snapshot) => {
      set({ programAssignments: snapshot.docs.map(mapAssignment) });
    }, (err) => handleError("programAssignments", err));
    unsubscribers.push(assignmentsUnsub);

    // Dashboard Stats listener
    const statsQuery = isGlobalAdmin
      ? collection(firebaseDB, "dashboard_groupStats")
      : query(collection(firebaseDB, "dashboard_groupStats"), where("orgId", "==", orgId));

    const statsUnsub = onSnapshot(statsQuery, (snapshot) => {
      set({
        dashboardStats: snapshot.docs.map((d) => ({
          groupId: d.id,
          ...d.data()
        } as DashboardGroupStats))
      });
    }, (err) => handleError("dashboard_groupStats", err));
    unsubscribers.push(statsUnsub);
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
    // Clean up existing user profile listener if it exists
    if (userUnsub) {
      userUnsub();
      userUnsub = null;
    }

    if (firebaseUser) {
      const isInactive = checkInactivity();
      if (isInactive) {
        set({ isLoadingAuth: false });
        return;
      }
      // 1. Setup real-time listener for the user doc
      userUnsub = onSnapshot(doc(firebaseDB, "users", firebaseUser.uid), async (snapshot) => {
        if (snapshot.exists()) {
          const user = mapUser(snapshot as any);
          const currentUser = get().authUser;

          const roleChanged = currentUser && currentUser.role !== user.role;
          const orgChanged = currentUser && currentUser.orgId !== user.orgId;

          let finalOrgId = user.orgId || CENTRAL_ORG_ID;

          // If role changed, force refresh token to sync custom claims
          if (roleChanged || !currentUser) {
            console.log(`[Auth] Role: ${user.role}, Org: ${user.orgId}. Syncing session...`);
            await firebaseUser.getIdToken(true);
            const tokenResult = await firebaseUser.getIdTokenResult(true);
            finalOrgId = (tokenResult.claims.orgId as string) || user.orgId || CENTRAL_ORG_ID;
          }

          set({
            authUser: user,
            isLoadingAuth: false,
            authError: null,
            isProvisioning: false
          });

          // Setup/Re-setup data listeners if identity context changed or first time
          if (roleChanged || orgChanged || unsubscribers.length === 0) {
            setupListeners(user, finalOrgId);
          }
        } else {
          const isCreating = get().isCreatingOrg || localStorage.getItem(CREATING_ORG_KEY);
          if (isCreating) {
            console.log("[Auth] User doc not found yet, but isCreatingOrg is true.");
            return;
          }
          set({ authUser: null, isLoadingAuth: false, authError: "User profile not found." });
          cleanupListeners();
        }
      }, (error) => {
        console.error("User doc sync failed", error);
        set({ authError: "Failed to sync user profile." });
      });

    } else {
      set({ authUser: null, isLoadingAuth: false, isCreatingOrg: false, isProvisioning: false, authError: null });
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
    organisation: null,
    organisations: [],
    users: [],
    profiles: [],
    assessments: [],
    reports: [],
    categories: [],
    groups: [],
    programs: [],
    programAssignments: [],
    dashboardStats: [],
    authUser: null,
    isLoadingAuth: true,
    isCreatingOrg: false,
    isProvisioning: false,
    authError: null,
    login: async (email: string, password: string) => {
      try {
        set({ isLoadingAuth: true, authError: null });
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);

        // Force refresh to get latest claims
        const idTokenResult = await credential.user.getIdTokenResult(true);
        const orgId = (idTokenResult.claims.orgId as string) || CENTRAL_ORG_ID;

        const userDoc = await getDoc(doc(firebaseDB, "users", credential.user.uid));
        if (!userDoc.exists()) {
          set({ authError: "User profile not found in organisation.", isLoadingAuth: false });
          return false;
        }
        const user = mapUser(userDoc as any);
        if (user.status === "disabled") {
          set({ authError: "Your account is disabled. Contact admin.", isLoadingAuth: false });
          return false;
        }

        localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString());
        set({ authUser: user, isLoadingAuth: false });
        setupListeners(user, orgId);
        return true;
      } catch (error: any) {
        console.error("Login failed", error);
        set({ authError: "Wrong email or password", isLoadingAuth: false });
        return false;
      }
    },
    logout: () => {
      signOut(firebaseAuth).catch((error) => console.error("Failed to sign out", error));
      localStorage.removeItem(LAST_ACTIVE_KEY);
      cleanupListeners();
      set({
        authUser: null,
        organisation: null,
        organisations: [],
        profiles: [],
        assessments: [],
        reports: [],
        categories: [],
        groups: [],
        programs: [],
        programAssignments: [],
        dashboardStats: [],
        authError: null,
      });
    },
    createOrganisation: async (orgName: string, name: string, email: string, password: string) => {
      const setCreating = (val: boolean) => {
        if (val) localStorage.setItem(CREATING_ORG_KEY, Date.now().toString());
        else localStorage.removeItem(CREATING_ORG_KEY);
        set({ isCreatingOrg: val });
      };

      try {
        set({ isLoadingAuth: true, authError: null });
        setCreating(true);

        // 1. Create Auth user
        console.log("Creating Auth user...");
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const uid = credential.user.uid;
        // Revert to unique orgId for new clinics
        const orgId = `org-${Math.random().toString(36).substring(2, 9)}`;
        console.log(`Auth user created: ${uid}. New orgId generated: ${orgId}`);

        // 2. Create Organisation doc
        console.log("Writing Organisation doc to Firestore...");
        await setDoc(doc(firebaseDB, "orgs", orgId), {
          id: orgId,
          name: orgName,
          phone: "",
          contactEmail: email,
          createdAt: new Date().toISOString(),
          createdBy: uid,
          settings: {
            dateFormat: "DD/MM/YYYY",
            measurementSystem: "metric",
            mode: "clinical",
            displayNormativeData: true,
          },
        });
        console.log("Organisation doc written successfully.");

        // 3. Create User doc in root collection
        console.log("Writing User doc to Firestore root...");
        await setDoc(doc(firebaseDB, "users", uid), {
          uid,
          orgId,
          name,
          email,
          role: "clinician",
          isAdmin: false,
          status: "active",
          allowedGroupIds: ["*"],
          createdBy: uid, // Crucial for bootstrap bypass
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log("User doc written successfully to root.");

        // 4. Finalize state immediately (No polling needed)
        console.log("Finalizing workspace state...");
        const user: User = {
          uid,
          orgId,
          name,
          email,
          role: "clinician",
          isAdmin: false,
          status: "active",
          allowedGroupIds: ["*"],
          createdBy: uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          authUser: user,
          isLoadingAuth: false,
          isCreatingOrg: false,
          isProvisioning: false,
          authError: null
        });

        setCreating(false);
        setupListeners(user, orgId);
        console.log("Signup flow completed instantly.");
      } catch (error: any) {
        console.error("CRITICAL AUTH FAILURE:", error);
        set({ authError: error.message, isLoadingAuth: false });
        // Clean up even on fail, though we might want to keep it if we want retries
        // But for now, clean up so the error can be shown if it's a real fail
        if (typeof setCreating === 'function') setCreating(false);
        throw error;
      }
    },
    createInvite: async (email: string, inviteRole: UserRole, allowedGroupIds?: string[]) => {
      try {
        const inviteFunc = httpsCallable(firebaseFunctions, "createInvite");
        const result = await inviteFunc({ email, inviteRole, allowedGroupIds }) as any;
        const orgId = get().organisation?.id;
        return `${window.location.origin}/accept-invite?inviteId=${result.data.inviteId}&orgId=${orgId}`;
      } catch (error: any) {
        console.error("Failed to create invite", error);
        throw error;
      }
    },
    acceptInvite: async (inviteId: string, orgId: string, name: string, password: string) => {
      try {
        set({ isLoadingAuth: true });
        const acceptFunc = httpsCallable(firebaseFunctions, "acceptInviteAndSetPassword");
        await acceptFunc({ inviteId, orgId, name, password });

        // Re-login to get session
        const emailDoc = await getDoc(doc(firebaseDB, "invites", inviteId));
        const email = emailDoc.data()?.email;
        if (email) {
          await get().login(email, password);
        }
      } catch (error: any) {
        console.error("Failed to accept invite", error);
        set({ authError: error.message, isLoadingAuth: false });
        throw error;
      }
    },
    uploadFile: async (path: string, file: File) => {
      const storageRef = ref(firebaseStorage, path);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    },
    addProfile: async (profile: Omit<Profile, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
      const authUser = get().authUser;
      const orgId = get().organisation?.id;
      if (!authUser || !orgId) throw new Error("Authenticated user and organisation required");

      const now = new Date().toISOString();
      const newProfile: Profile = {
        id: `profile-${crypto.randomUUID().slice(0, 8)}`,
        ...profile,
        createdAt: now,
        updatedAt: now,
        createdBy: authUser.uid,
        status: "active",
        summary: {
          lastAssessmentAt: null,
          lastAssessmentType: null,
          latestScores: { postureScore: 0, riskScore: 0 },
        },
      };

      try {
        await setDoc(doc(firebaseDB, "profiles", newProfile.id), {
          ...newProfile,
          orgId,
          createdBy: authUser.uid // Redundant but explicit for rules
        });
      } catch (error) {
        console.error("Failed to persist profile", error);
        throw error;
      }
    },
    addAssessment: async (assessment: Omit<Assessment, "id" | "createdAt" | "updatedAt" | "createdBy" | "title"> & { title?: string }) => {
      const authUser = get().authUser;
      const orgId = get().organisation?.id;
      if (!authUser || !orgId) throw new Error("Authenticated user and organisation required");

      const now = new Date().toISOString();
      const newAssessment: Assessment = {
        id: `assessment-${crypto.randomUUID().slice(0, 8)}`,
        title: assessment.title || "New Assessment",
        ...assessment,
        createdAt: now,
        updatedAt: now,
        createdBy: authUser.uid,
        status: "draft",
      };

      try {
        await setDoc(doc(firebaseDB, "assessments", newAssessment.id), {
          ...newAssessment,
          orgId,
          createdBy: authUser.uid // Redundant but explicit for rules
        });
      } catch (error) {
        console.error("Failed to persist assessment", error);
        throw error;
      }
    },
    updateAssessment: async (assessmentId: string, patch: Partial<Assessment>) => {
      const orgId = get().organisation?.id;
      if (!orgId) throw new Error("Organisation required");

      const updatedAt = new Date().toISOString();
      const cleanPatch = { ...patch, updatedAt };

      try {
        await updateDoc(doc(firebaseDB, "assessments", assessmentId), cleanPatch as any);
      } catch (error) {
        console.error("Failed to update assessment", error);
        throw error;
      }
    },
    addReport: async (report: Report) => {
      const orgId = get().organisation?.id;
      if (!orgId) throw new Error("Organisation required");

      try {
        await setDoc(doc(firebaseDB, "reports", report.id), {
          ...report,
          orgId
        });
      } catch (error) {
        console.error("Failed to save report", error);
        throw error;
      }
    },
    updateUserRole: async (userId: string, role: UserRole) => {
      const orgId = get().organisation?.id;
      if (!orgId) throw new Error("Organisation required");

      try {
        const isAdmin = role === 'admin' || role === 'owner';
        await updateDoc(doc(firebaseDB, "users", userId), { role, isAdmin });
      } catch (error) {
        console.error("Failed to update user role", error);
        throw error;
      }
    },
    updateOrganisation: async (details: Partial<Organisation>) => {
      const orgId = get().organisation?.id;
      if (!orgId) throw new Error("Organisation required");

      try {
        await updateDoc(doc(firebaseDB, "orgs", orgId), details as any);
      } catch (error) {
        console.error("Failed to update organisation", error);
        throw error;
      }
    },
  };
});
