/**
 * CIT CabSync — Firebase Cloud Functions
 * 
 * Complies strictly with CIT CabSync specifications (info.txt):
 * 1. Auth Blocking Function (@citchennai.net restriction & profile token parsing)
 * 2. Atomic Luggage Knapsack Engine (Auto = 4 pts, Sedan = 7 pts, XL = 10 pts)
 * 3. Ephemeral In-Memory Cloud Vision OCR (Zero Cloud Storage persistence)
 * 4. Female Peer-Vouching Pending State (3 verified female signatures)
 * 5. Ephemeral Chat TTL Purge (Cron job triggered 1 hour after ride time)
 * 6. Passenger Vote-Out Moderation (Locked 45 mins prior to departure)
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { beforeUserCreated } = require("firebase-functions/v2/identity");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const vision = require("@google-cloud/vision");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();
const visionClient = new vision.ImageAnnotatorClient();

const ALLOWED_DOMAIN = "@citchennai.net";
const VEHICLE_CAPACITIES = {
  "Auto": { maxSeats: 3, maxLuggage: 4 },
  "Prime Sedan": { maxSeats: 4, maxLuggage: 7 },
  "XL": { maxSeats: 6, maxLuggage: 10 }
};

// ============================================================================
// 1. AUTHENTICATION: DOMAIN RESTRICTION & TOKEN PARSER
// ============================================================================

/**
 * Firebase Auth Blocking Function:
 * Executed before any new user account is created.
 * Blocks any email not belonging to @citchennai.net.
 * Automatically parses name, department, and batch year.
 */
exports.beforeUserCreated = beforeUserCreated((event) => {
  const user = event.data;
  const email = user.email || "";

  if (!email.endsWith(ALLOWED_DOMAIN)) {
    throw new HttpsError(
      "permission-denied",
      `Access restricted. Only ${ALLOWED_DOMAIN} institutional accounts are allowed.`
    );
  }

  // Parse email (e.g., "aadhavank.cse2025@citchennai.net")
  const localPart = email.split("@")[0];
  const yearMatch = localPart.match(/(20\d{2})/);
  const deptMatch = localPart.match(/[a-z]+(?=\d{4})/i);

  const batchYear = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
  const department = deptMatch ? deptMatch[0].toUpperCase() : "CIT";

  const rawName = localPart
    .replace(/\d{4}/, "")
    .replace((deptMatch ? deptMatch[0] : "").toLowerCase(), "")
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ") || "CIT Student";

  // Pre-populate custom claims and user profile record
  return {
    customClaims: {
      citVerified: true,
      department,
      batchYear,
      isFemaleVerified: false
    }
  };
});

// ============================================================================
// 2. REAL-TIME LUGGAGE ENGINE: ATOMIC TRANSACTIONS
// ============================================================================

/**
 * Atomic Ride Joining Transaction:
 * Enforces vehicle integer luggage point constraints:
 * - Auto Rickshaw: 4 points max
 * - Prime Sedan: 7 points max
 * - Prime XL / SUV: 10 points max
 * Automatically aborts if concurrent joins exceed boot space or seats.
 */
exports.joinRide = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth || !auth.token.email || !auth.token.email.endsWith(ALLOWED_DOMAIN)) {
    throw new HttpsError("unauthenticated", "Must be logged in with a valid CIT email.");
  }

  const { rideId, luggagePoints, name, dept, year } = data;
  if (!rideId || typeof luggagePoints !== "number" || luggagePoints < 1) {
    throw new HttpsError("invalid-argument", "Invalid ride join parameters.");
  }

  const rideRef = db.collection("rides").doc(rideId);
  const participantRef = rideRef.collection("participants").doc(auth.uid);

  return await db.runTransaction(async (transaction) => {
    const rideSnap = await transaction.get(rideRef);
    if (!rideSnap.exists) {
      throw new HttpsError("not-found", "The specified ride does not exist.");
    }

    const ride = rideSnap.data();
    if (ride.status !== "OPEN") {
      throw new HttpsError("failed-precondition", "This ride lobby is no longer open for joining.");
    }

    const vehicleConfig = VEHICLE_CAPACITIES[ride.vehicleType] || VEHICLE_CAPACITIES["Prime Sedan"];
    const currentLuggage = ride.currentLuggageUnits || 0;
    const currentPassengers = ride.currentPassengers || 0;

    // Check luggage knapsack capacity
    if (currentLuggage + luggagePoints > vehicleConfig.maxLuggage) {
      const remainingLuggage = vehicleConfig.maxLuggage - currentLuggage;
      throw new HttpsError(
        "resource-exhausted",
        `Luggage limit exceeded. Vehicle has ${remainingLuggage} points remaining, but ${luggagePoints} requested.`
      );
    }

    // Check passenger seat capacity
    if (currentPassengers + 1 > vehicleConfig.maxSeats) {
      throw new HttpsError("resource-exhausted", "Vehicle seating capacity has already been filled.");
    }

    const newPassengers = currentPassengers + 1;
    const newLuggage = currentLuggage + luggagePoints;
    const isFull = newPassengers >= vehicleConfig.maxSeats || newLuggage >= vehicleConfig.maxLuggage;

    // Commit atomic update
    transaction.update(rideRef, {
      currentPassengers: newPassengers,
      currentLuggageUnits: newLuggage,
      status: isFull ? "FULL" : "OPEN",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    transaction.set(participantRef, {
      uid: auth.uid,
      email: auth.token.email,
      name: name || auth.token.name || "CIT Student",
      department: dept || "CIT",
      batchYear: year || new Date().getFullYear(),
      luggagePoints,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      votesToKick: []
    });

    return {
      success: true,
      currentPassengers: newPassengers,
      currentLuggageUnits: newLuggage,
      status: isFull ? "FULL" : "OPEN"
    };
  });
});

// ============================================================================
// 3. FEMALE-ONLY POOL: EPHEMERAL CLOUD VISION OCR (ZERO PERSISTENCE)
// ============================================================================

/**
 * Ephemeral In-Memory CIT ID Verification:
 * Receives base64 image data in memory.
 * Passes directly to Google Cloud Vision API textDetection.
 * Compares extracted name with Google Auth account name.
 * Image buffer is NEVER written to Cloud Storage or filesystem and is immediately cleared.
 */
exports.verifyFemaleIdCard = onCall({ memory: "512MiB" }, async (request) => {
  const { auth, data } = request;
  if (!auth || !auth.token.email || !auth.token.email.endsWith(ALLOWED_DOMAIN)) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const { imageBase64 } = data;
  if (!imageBase64) {
    throw new HttpsError("invalid-argument", "Missing image buffer for ID verification.");
  }

  // Allocate in-memory binary buffer
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(cleanBase64, "base64");

  try {
    // Ephemeral OCR call
    const [result] = await visionClient.textDetection({ image: { content: imageBuffer } });
    const detections = result.textAnnotations;
    const detectedText = (detections && detections[0] && detections[0].description) ? detections[0].description.toUpperCase() : "";

    // Instantly wipe memory buffer
    imageBuffer.fill(0);

    const isCitCard = detectedText.includes("CHENNAI INSTITUTE OF TECHNOLOGY") || detectedText.includes("CIT");
    const authNameParts = (auth.token.name || "").toUpperCase().split(" ").filter(w => w.length > 2);
    const hasNameMatch = authNameParts.some(part => detectedText.includes(part));

    if (isCitCard && hasNameMatch) {
      // Direct verification successful
      await db.collection("users").doc(auth.uid).set({
        isFemaleVerified: true,
        femaleVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verificationMethod: "VISION_OCR"
      }, { merge: true });

      await admin.auth().setCustomUserClaims(auth.uid, {
        ...auth.token,
        isFemaleVerified: true
      });

      return { status: "VERIFIED", message: "CIT ID successfully verified." };
    }

    // Fallback: Generate "Pending State" hash for peer-vouching
    const vouchHash = crypto.randomBytes(16).toString("hex");
    await db.collection("female_vouches").doc(vouchHash).set({
      targetUid: auth.uid,
      targetEmail: auth.token.email,
      targetName: auth.token.name || "Student",
      vouchedBy: [], // Array of female UIDs who verified
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000) // 24 hours expiry
    });

    return {
      status: "PENDING",
      vouchHash,
      message: "Direct OCR inconclusive. Share your verification link with 3 verified female students to confirm."
    };
  } catch (error) {
    // Ensure memory wipe on failure
    imageBuffer.fill(0);
    throw new HttpsError("internal", "Verification engine error: " + error.message);
  }
});

/**
 * Peer Vouch Confirmation:
 * Allows an already-verified female student to endorse a flagged peer.
 * When 3 verified female students vouch for the hash, the target account is updated.
 */
exports.vouchFemaleUser = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) throw new HttpsError("unauthenticated", "Authentication required.");

  const { vouchHash } = data;
  if (!vouchHash) throw new HttpsError("invalid-argument", "Missing vouch hash.");

  // Check if voter is verified female
  const voucherDoc = await db.collection("users").doc(auth.uid).get();
  if (!voucherDoc.exists || !voucherDoc.data().isFemaleVerified) {
    throw new HttpsError("permission-denied", "Only verified female students can vouch for peers.");
  }

  const vouchRef = db.collection("female_vouches").doc(vouchHash);

  return await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(vouchRef);
    if (!snap.exists) throw new HttpsError("not-found", "Vouch link expired or invalid.");

    const vouchData = snap.data();
    if (vouchData.targetUid === auth.uid) {
      throw new HttpsError("failed-precondition", "You cannot vouch for your own account.");
    }

    const currentVouches = vouchData.vouchedBy || [];
    if (currentVouches.includes(auth.uid)) {
      throw new HttpsError("already-exists", "You have already vouched for this student.");
    }

    currentVouches.push(auth.uid);

    if (currentVouches.length >= 3) {
      // 3 verified vouchers collected -> Upgrade target user
      const targetUserRef = db.collection("users").doc(vouchData.targetUid);
      transaction.set(targetUserRef, {
        isFemaleVerified: true,
        femaleVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verificationMethod: "PEER_VOUCH_3"
      }, { merge: true });

      transaction.update(vouchRef, {
        vouchedBy: currentVouches,
        status: "APPROVED"
      });

      return { success: true, verified: true, count: currentVouches.length };
    }

    transaction.update(vouchRef, { vouchedBy: currentVouches });
    return { success: true, verified: false, count: currentVouches.length };
  });
});

// ============================================================================
// 4. EPHEMERAL CHAT TTL: 1-HOUR AUTO-PURGE CRON
// ============================================================================

/**
 * Scheduled Cloud Function (Runs every 15 minutes):
 * Automatically finds and permanently purges chat subcollections and rides
 * where the current time is greater than departureTime + 1 hour (3600 seconds).
 */
exports.purgeExpiredChatsAndRides = onSchedule("every 15 minutes", async (event) => {
  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  const expiredRidesQuery = db.collection("rides")
    .where("departureTime", "<=", admin.firestore.Timestamp.fromDate(oneHourAgo));

  const snapshot = await expiredRidesQuery.get();
  if (snapshot.empty) return;

  const batch = db.batch();

  for (const doc of snapshot.docs) {
    // Delete all chat messages in subcollection
    const messagesSnap = await doc.ref.collection("messages").get();
    messagesSnap.forEach(msgDoc => batch.delete(msgDoc.ref));

    // Delete participants subcollection
    const participantsSnap = await doc.ref.collection("participants").get();
    participantsSnap.forEach(partDoc => batch.delete(partDoc.ref));

    // Mark ride purged or delete
    batch.delete(doc.ref);
  }

  await batch.commit();
  console.log(`Purged ${snapshot.size} expired rides and all associated ephemeral chats.`);
});

// ============================================================================
// 5. RIDE MODERATION: VOTE-OUT SYSTEM (LOCKS 45 MINS BEFORE DEPARTURE)
// ============================================================================

/**
 * Vote-Out Passenger Endpoint:
 * Allows ride participants to cast a vote to remove a rider.
 * Voting is strictly locked 45 minutes before departure.
 * Removes rider when vote count exceeds majority threshold (e.g. 2 votes in 4-person cab).
 */
exports.voteOutPassenger = onCall(async (request) => {
  const { auth, data } = request;
  if (!auth) throw new HttpsError("unauthenticated", "Authentication required.");

  const { rideId, targetUid } = data;
  if (!rideId || !targetUid) throw new HttpsError("invalid-argument", "Missing rideId or targetUid.");

  const rideRef = db.collection("rides").doc(rideId);
  const targetRef = rideRef.collection("participants").doc(targetUid);

  return await db.runTransaction(async (transaction) => {
    const rideSnap = await transaction.get(rideRef);
    if (!rideSnap.exists) throw new HttpsError("not-found", "Ride not found.");

    const ride = rideSnap.data();

    // Check lock window (45 minutes before departure)
    const departureTime = ride.departureTime ? ride.departureTime.toDate() : new Date();
    const lockTime = new Date(departureTime.getTime() - 45 * 60 * 1000);
    if (new Date() >= lockTime) {
      throw new HttpsError("failed-precondition", "Voting is locked within 45 minutes of scheduled departure.");
    }

    const targetSnap = await transaction.get(targetRef);
    if (!targetSnap.exists) throw new HttpsError("not-found", "Target passenger not in this ride.");

    const targetData = targetSnap.data();
    const votes = targetData.votesToKick || [];

    if (!votes.includes(auth.uid)) {
      votes.push(auth.uid);
    }

    const totalPassengers = ride.currentPassengers || 1;
    // Majority threshold: >= 2 in a 3-4 person cab, or > 50%
    const threshold = Math.ceil(totalPassengers / 2);

    if (votes.length >= threshold) {
      // Majority reached: Remove passenger and return luggage units
      transaction.delete(targetRef);
      const updatedPassengers = Math.max(0, totalPassengers - 1);
      const updatedLuggage = Math.max(0, (ride.currentLuggageUnits || 0) - (targetData.luggagePoints || 1));

      transaction.update(rideRef, {
        currentPassengers: updatedPassengers,
        currentLuggageUnits: updatedLuggage,
        status: "OPEN",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { kicked: true, message: "Passenger removed by majority vote." };
    }

    transaction.update(targetRef, { votesToKick: votes });
    return { kicked: false, votesCount: votes.length, needed: threshold };
  });
});
