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

const mapUser = (snapshot: QueryDocumentSnapshot<DocumentData>): User => {
  const data = snapshot.data();
  return {
    uid: snapshot.id,
    name: data.name ?? "",
    email: data.email ?? "",
    role: normalizeRole(data.role),
    isAdmin: !!data.isAdmin,
    allowedGroupIds: data.allowedGroupIds ?? [],
    status: data.status ?? "active",
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

let unsubscribers: Unsubscribe[] = [];

export const useAppStore = create<AppState>((set, get) => {
  const cleanupListeners = () => {
    unsubscribers.forEach((unsub) => unsub());
    unsubscribers = [];
  };

  const setupListeners = (user: User, orgId: string) => {
    cleanupListeners();

    const handleError = (collectionName: string, _error: any) => {
      // Log more quietly, as this is often just a propagation race condition
      console.log(`[Sync] Waiting for full access to ${collectionName}...`);
    };

    // Organisation listener
    const orgUnsub = onSnapshot(doc(firebaseDB, "orgs", orgId), (snapshot) => {
      set({ organisation: mapOrganisation(snapshot) });
    }, (err) => handleError("organisation", err));
    unsubscribers.push(orgUnsub);

    // Users listener
    const usersUnsub = onSnapshot(collection(firebaseDB, "orgs", orgId, "users"), (snapshot) => {
      set({ users: snapshot.docs.map(mapUser) });
    }, (err) => handleError("users", err));
    unsubscribers.push(usersUnsub);

    // Categories listener
    const categoriesUnsub = onSnapshot(collection(firebaseDB, "orgs", orgId, "categories"), (snapshot) => {
      set({ categories: snapshot.docs.map(mapCategory) });
    }, (err) => handleError("categories", err));
    unsubscribers.push(categoriesUnsub);

    // Groups listener
    const groupsUnsub = onSnapshot(collection(firebaseDB, "orgs", orgId, "groups"), (snapshot) => {
      set({ groups: snapshot.docs.map(mapGroup) });
    }, (err) => handleError("groups", err));
    unsubscribers.push(groupsUnsub);

    // Profiles listener
    const profilesQuery = user.role === "owner" || user.role === "admin"
      ? collection(firebaseDB, "orgs", orgId, "profiles")
      : query(collection(firebaseDB, "orgs", orgId, "profiles"), where("assignedClinicianIds", "array-contains", user.uid));

    const profilesUnsub = onSnapshot(profilesQuery, (snapshot) => {
      set({ profiles: snapshot.docs.map(mapProfile) });
    }, (err) => handleError("profiles", err));
    unsubscribers.push(profilesUnsub);

    // Assessments listener
    const assessmentsUnsub = onSnapshot(collection(firebaseDB, "orgs", orgId, "assessments"), (snapshot) => {
      set({ assessments: snapshot.docs.map(mapAssessment) });
    }, (err) => handleError("assessments", err));
    unsubscribers.push(assessmentsUnsub);

    // Reports listener
    const reportsUnsub = onSnapshot(collection(firebaseDB, "orgs", orgId, "reports"), (snapshot) => {
      set({ reports: snapshot.docs.map(mapReport) });
    }, (err) => handleError("reports", err));
    unsubscribers.push(reportsUnsub);

    // Programs listener
    const programsUnsub = onSnapshot(collection(firebaseDB, "orgs", orgId, "programs"), (snapshot) => {
      set({ programs: snapshot.docs.map(mapProgram) });
    }, (err) => handleError("programs", err));
    unsubscribers.push(programsUnsub);

    // Program Assignments listener
    const assignmentsUnsub = onSnapshot(collection(firebaseDB, "orgs", orgId, "programAssignments"), (snapshot) => {
      set({ programAssignments: snapshot.docs.map(mapAssignment) });
    }, (err) => handleError("programAssignments", err));
    unsubscribers.push(assignmentsUnsub);

    // Dashboard Stats listener
    const statsUnsub = onSnapshot(collection(firebaseDB, "orgs", orgId, "dashboard_groupStats"), (snapshot) => {
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
    if (firebaseUser) {
      const isInactive = checkInactivity();
      if (isInactive) {
        set({ isLoadingAuth: false });
        return;
      }

      try {
        // Step 2 — Force token refresh once to get custom claims
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const orgId = tokenResult.claims.orgId as string;

        if (!orgId) {
          // RACE CONDITION FIX: If we are currently creating an org, don't show an error yet.
          // The createOrganisation function is polling for these claims.
          const creatingOrgTs = localStorage.getItem(CREATING_ORG_KEY);
          const isJustCreating = creatingOrgTs && (Date.now() - parseInt(creatingOrgTs)) < 5 * 60 * 1000; // 5 min window

          // Safety: If the account was created less than 2 minutes ago, also suppress the error.
          const creationTime = firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).getTime() : 0;
          const isNewAccount = (Date.now() - creationTime) < 2 * 60 * 1000;

          if (get().isCreatingOrg || isJustCreating || isNewAccount) {
            console.log("[Auth] skipping 'not configured' error as account is potentially still being provisioned...");
            set({ isLoadingAuth: false, isProvisioning: true });
            return;
          }
          set({ authUser: null, isLoadingAuth: false, isProvisioning: false, authError: "Your account is not configured. Contact admin." });
          return;
        }

        set({ isProvisioning: false }); // Claims found, no longer provisioning

        // Step 3 — Load user doc
        const userDoc = await getDoc(doc(firebaseDB, "orgs", orgId, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const user = mapUser(userDoc as any);
          set({ authUser: user, isLoadingAuth: false, authError: null });
          setupListeners(user, orgId);
        } else {
          set({ authUser: null, isLoadingAuth: false, authError: "User profile not found in organisation." });
        }
      } catch (error) {
        console.error("Failed to rehydrate auth", error);
        set({ authUser: null, isLoadingAuth: false, authError: "Failed to load profile." });
      }
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
        const orgId = idTokenResult.claims.orgId as string;

        if (!orgId) {
          set({ authError: "Missing organisation configuration.", isLoadingAuth: false });
          return false;
        }

        const userDoc = await getDoc(doc(firebaseDB, "orgs", orgId, "users", credential.user.uid));
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
        const orgId = `org-${Math.random().toString(36).substring(2, 9)}`;
        console.log(`Auth user created: ${uid}. Generated orgId: ${orgId}`);

        // 2. Create Organisation doc
        console.log("Writing Organisation doc to Firestore...");
        await setDoc(doc(firebaseDB, "orgs", orgId), {
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

        // 3. Create User doc
        console.log("Writing User doc to Firestore...");
        await setDoc(doc(firebaseDB, "orgs", orgId, "users", uid), {
          uid,
          name,
          email,
          role: "clinician",
          isAdmin: false,
          status: "active",
          allowedGroupIds: ["*"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log("User doc written successfully.");

        // Force a token refresh to get custom claims (set by background trigger)
        console.log("Waiting for backend trigger to set custom claims...");
        let attempts = 0;
        let hasClaim = false;
        const MAX_POLLING_ATTEMPTS = 20; // Increased from 15
        const POLLING_INTERVAL_MS = 1500; // Decreased from 2000 for better responsiveness

        while (attempts < MAX_POLLING_ATTEMPTS && !hasClaim) {
          attempts++;
          console.log(`Polling for claims (attempt ${attempts}/${MAX_POLLING_ATTEMPTS})...`);

          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

          try {
            // RELOAD is critical to pick up backend changes in some environments
            await credential.user.reload();
            // Force refresh token (true) to ensure we get the latest claims
            const idTokenResult = await credential.user.getIdTokenResult(true);

            if (idTokenResult.claims.orgId) {
              console.log("Success! Custom claims detected in token:", idTokenResult.claims.orgId);
              hasClaim = true;
            } else {
              console.warn(`Claims not ready yet (attempt ${attempts}), retrying...`);
            }
          } catch (e) {
            console.warn("Error during polling, retrying...", e);
          }
        }

        if (!hasClaim) {
          console.warn("TIMEOUT: Custom claims delayed. Attempting best-effort workspace entry...");
          // We don't throw yet, because the owner-bypass in Firestore rules might allow us to work 
          // while the background trigger catches up.
        }

        // Re-run rehydration logic
        console.log("Rehydrating app state...");
        // Use the generated orgId since we might not have it in claims yet
        const userDoc = await getDoc(doc(firebaseDB, "orgs", orgId, "users", uid));
        if (userDoc.exists()) {
          const user = mapUser(userDoc as any);
          set({ authUser: user, isLoadingAuth: false, isProvisioning: false });
          setCreating(false);
          setupListeners(user, orgId);
          console.log("Signup flow completed with best-effort rehydration.");
        } else {
          console.error("User doc not found after creation during rehydration.");
          set({ isLoadingAuth: false });
          setCreating(false);
          if (!hasClaim) {
            throw new Error("Your workspace is taking a moment to initialize. Please wait 10 seconds and refresh the page.");
          }
          throw new Error("We encountered an issue finalizing your workspace. Please sign in again.");
        }
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
        const emailDoc = await getDoc(doc(firebaseDB, "orgs", orgId, "invites", inviteId));
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
        await setDoc(doc(firebaseDB, "orgs", orgId, "profiles", newProfile.id), newProfile);
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
        await setDoc(doc(firebaseDB, "orgs", orgId, "assessments", newAssessment.id), newAssessment);
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
        await updateDoc(doc(firebaseDB, "orgs", orgId, "assessments", assessmentId), cleanPatch as any);
      } catch (error) {
        console.error("Failed to update assessment", error);
        throw error;
      }
    },
    addReport: async (report: Report) => {
      const orgId = get().organisation?.id;
      if (!orgId) throw new Error("Organisation required");

      try {
        await setDoc(doc(firebaseDB, "orgs", orgId, "reports", report.id), report);
      } catch (error) {
        console.error("Failed to save report", error);
        throw error;
      }
    },
    updateUserRole: async (userId: string, role: UserRole) => {
      const orgId = get().organisation?.id;
      if (!orgId) throw new Error("Organisation required");

      try {
        await updateDoc(doc(firebaseDB, "orgs", orgId, "users", userId), { role });
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
