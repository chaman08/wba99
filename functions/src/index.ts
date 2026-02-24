import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import * as admin from "firebase-admin";

admin.initializeApp();

setGlobalOptions({ region: "us-central1" });

const db = admin.firestore();

/**
 * A) onAssessmentCreate (v2)
 */
export const onAssessmentCreate = onDocumentCreated("orgs/{orgId}/assessments/{assessmentId}", async (event: any) => {
    const data = event.data?.data();
    if (!data) return;

    const { profileId } = data;
    const { orgId } = event.params;

    // Update profiles/{profileId}.summary
    const profileRef = db.doc(`orgs/${orgId}/profiles/${profileId}`);
    await profileRef.set({
        summary: {
            lastAssessmentAt: data.createdAt,
            lastAssessmentType: data.type,
            latestScores: data.metricsSummary || {},
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Update group stats
    if (data.groupId) {
        const statsRef = db.doc(`orgs/${orgId}/dashboard_groupStats/${data.groupId}`);
        await statsRef.set({
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
});

/**
 * B) onProfileUpdate (v2)
 */
export const onProfileUpdate = onDocumentUpdated("orgs/{orgId}/profiles/{profileId}", async (event: any) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const { orgId } = event.params;

    if (before.groupId !== after.groupId) {
        if (before.groupId) {
            await db.doc(`orgs/${orgId}/groups/${before.groupId}`).update({
                profileCount: admin.firestore.FieldValue.increment(-1),
            });
        }
        if (after.groupId) {
            await db.doc(`orgs/${orgId}/groups/${after.groupId}`).update({
                profileCount: admin.firestore.FieldValue.increment(1),
            });
        }
    }
});

/**
 * C) createOrganisationAndOwner (v2 callable)
 * @deprecated Moving to client-side org creation to avoid CORS issues.
 */
export const createOrganisationAndOwner = onCall({
    cors: [
        "http://localhost:5173",
        "https://wba99-c7a6a.web.app",
        "https://wba99-c7a6a.firebaseapp.com"
    ],
    invoker: "public",
    maxInstances: 10,
}, async (request: any) => {
    // ... logic preserved for now ...
    return { success: false, message: "Use client-side creation" };
});

/**
 * F) onUserCreate (v2)
 * Automatically set custom claims when a user document is created in an organisation.
 */
export const onUserCreate = onDocumentCreated("orgs/{orgId}/users/{userId}", async (event: any) => {
    const { orgId, userId } = event.params;
    const data = event.data?.data();

    console.log(`[onUserCreate] TRIGGERED - org: ${orgId}, user: ${userId}`);

    if (!data) {
        console.error(`[onUserCreate] ERROR: No data found for user ${userId} in org ${orgId}`);
        return;
    }

    const { role } = data;
    if (!role) {
        console.warn(`[onUserCreate] WARNING: Role missing for user ${userId}, defaulting to clinician`);
    }

    const targetRole = role || "clinician";

    try {
        // Double check if user exists in Auth
        const user = await admin.auth().getUser(userId);
        console.log(`[onUserCreate] Found Auth user: ${user.email}`);

        await admin.auth().setCustomUserClaims(userId, { orgId, role: targetRole });
        console.log(`[onUserCreate] SUCCESS: Claims set { orgId: ${orgId}, role: ${targetRole} } for ${userId}`);
    } catch (error) {
        console.error(`[onUserCreate] CRITICAL FAILURE for user ${userId}:`, error);
    }
});

/**
 * D) createInvite (v2 callable)
 */
export const createInvite = onCall({ cors: true }, async (request: any) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Must be logged in.");

    const { orgId, role } = request.auth.token;
    if (role !== "owner" && role !== "admin") {
        throw new HttpsError("permission-denied", "Only admins can invite.");
    }

    const { email, inviteRole, allowedGroupIds } = request.data;
    const inviteId = `inv-${Math.random().toString(36).substring(2, 9)}`;

    const inviteData = {
        id: inviteId,
        email,
        role: inviteRole,
        allowedGroupIds: allowedGroupIds || [],
        createdBy: request.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "pending",
    };

    await db.doc(`orgs/${orgId}/invites/${inviteId}`).set(inviteData);

    return { inviteId, success: true };
});

/**
 * E) acceptInviteAndSetPassword (v2 callable)
 */
export const acceptInviteAndSetPassword = onCall({ cors: true }, async (request: any) => {
    const { inviteId, orgId, password, name } = request.data;

    const inviteRef = db.doc(`orgs/${orgId}/invites/${inviteId}`);
    const inviteSnap = await inviteRef.get();

    if (!inviteSnap.exists) throw new HttpsError("not-found", "Invite not found.");
    const invite = inviteSnap.data() as any;

    if (invite.status !== "pending") throw new HttpsError("failed-precondition", "Invite already used.");

    try {
        const userRecord = await admin.auth().createUser({
            email: invite.email,
            password,
            displayName: name,
        });

        const uid = userRecord.uid;

        await db.doc(`orgs/${orgId}/users/${uid}`).set({
            uid,
            name,
            email: invite.email,
            role: invite.role,
            status: "active",
            allowedGroupIds: invite.allowedGroupIds,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await admin.auth().setCustomUserClaims(uid, { orgId, role: invite.role });

        await inviteRef.update({ status: "accepted", updatedAt: admin.firestore.FieldValue.serverTimestamp() });

        await writeAuditLog(orgId, {
            action: "INVITE_ACCEPTED",
            entityType: "user",
            entityId: uid,
            userId: uid,
            details: { name, email: invite.email, role: invite.role },
        });

        return { uid, success: true };
    } catch (error: any) {
        console.error("Invite acceptance failed:", error);
        throw new HttpsError("internal", error.message || "Failed to complete onboarding.");
    }
});

/**
 * Helper: writeAuditLog
 */
async function writeAuditLog(orgId: string, log: any) {
    await db.collection(`orgs/${orgId}/auditLogs`).add({
        ...log,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
}
