import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";
import {
  validateWorkoutSession,
  workoutSessionToFirestore,
  workoutSessionFromFirestore,
} from "../models/workoutModels.js";

const WORKOUT_SESSIONS_COLLECTION = "workoutSessions";

export class WorkoutSessionServiceError extends Error {
  constructor(message, code = "UNKNOWN_ERROR") {
    super(message);
    this.name = "WorkoutSessionServiceError";
    this.code = code;
  }
}

export async function createWorkoutSession(sessionData) {
  try {
    if (!sessionData.userId) {
      throw new WorkoutSessionServiceError(
        "User ID is required",
        "INVALID_USER_ID"
      );
    }

    validateWorkoutSession(sessionData);

    const firestoreData = workoutSessionToFirestore(sessionData);

    const dataToSave = {
      ...firestoreData,
      startTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, WORKOUT_SESSIONS_COLLECTION),
      dataToSave
    );

    return docRef.id;
  } catch (error) {
    if (error instanceof WorkoutSessionServiceError) {
      throw error;
    }
    throw new WorkoutSessionServiceError(
      `Failed to create workout session: ${error.message}`,
      "CREATE_FAILED"
    );
  }
}

export async function getWorkoutSession(sessionId, userId) {
  try {
    if (!sessionId) {
      throw new WorkoutSessionServiceError(
        "Session ID is required",
        "INVALID_SESSION_ID"
      );
    }

    if (!userId) {
      throw new WorkoutSessionServiceError(
        "User ID is required",
        "INVALID_USER_ID"
      );
    }

    const docRef = doc(db, WORKOUT_SESSIONS_COLLECTION, sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();

    if (data.userId !== userId) {
      throw new WorkoutSessionServiceError(
        "Unauthorized access to workout session",
        "UNAUTHORIZED"
      );
    }

    return workoutSessionFromFirestore(docSnap.id, data);
  } catch (error) {
    if (error instanceof WorkoutSessionServiceError) {
      throw error;
    }
    throw new WorkoutSessionServiceError(
      `Failed to get workout session: ${error.message}`,
      "GET_FAILED"
    );
  }
}

export async function getUserWorkoutSessions(userId, options = {}) {
  try {
    if (!userId) {
      throw new WorkoutSessionServiceError(
        "User ID is required",
        "INVALID_USER_ID"
      );
    }

    const { status, limit } = options;

    let q = query(
      collection(db, WORKOUT_SESSIONS_COLLECTION),
      where("userId", "==", userId),
      orderBy("startTime", "desc")
    );

    if (status) {
      q = query(
        collection(db, WORKOUT_SESSIONS_COLLECTION),
        where("userId", "==", userId),
        where("status", "==", status),
        orderBy("startTime", "desc")
      );
    }

    const querySnapshot = await getDocs(q);

    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push(workoutSessionFromFirestore(doc.id, doc.data()));
    });

    if (limit && sessions.length > limit) {
      return sessions.slice(0, limit);
    }

    return sessions;
  } catch (error) {
    if (error instanceof WorkoutSessionServiceError) {
      throw error;
    }
    throw new WorkoutSessionServiceError(
      `Failed to get user workout sessions: ${error.message}`,
      "GET_USER_SESSIONS_FAILED"
    );
  }
}

export async function updateWorkoutSession(sessionId, userId, updates) {
  try {
    if (!sessionId) {
      throw new WorkoutSessionServiceError(
        "Session ID is required",
        "INVALID_SESSION_ID"
      );
    }

    if (!userId) {
      throw new WorkoutSessionServiceError(
        "User ID is required",
        "INVALID_USER_ID"
      );
    }

    const existingSession = await getWorkoutSession(sessionId, userId);

    if (!existingSession) {
      throw new WorkoutSessionServiceError(
        "Workout session not found",
        "NOT_FOUND"
      );
    }

    const updatedSession = {
      ...existingSession,
      ...updates,
    };

    validateWorkoutSession(updatedSession);

    const firestoreData = workoutSessionToFirestore(updatedSession);

    const updateData = { ...firestoreData };
    delete updateData.startTime;
    updateData.updatedAt = serverTimestamp();

    const docRef = doc(db, WORKOUT_SESSIONS_COLLECTION, sessionId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    if (error instanceof WorkoutSessionServiceError) {
      throw error;
    }
    throw new WorkoutSessionServiceError(
      `Failed to update workout session: ${error.message}`,
      "UPDATE_FAILED"
    );
  }
}

export async function deleteWorkoutSession(sessionId, userId) {
  try {
    if (!sessionId) {
      throw new WorkoutSessionServiceError(
        "Session ID is required",
        "INVALID_SESSION_ID"
      );
    }

    if (!userId) {
      throw new WorkoutSessionServiceError(
        "User ID is required",
        "INVALID_USER_ID"
      );
    }

    const existingSession = await getWorkoutSession(sessionId, userId);

    if (!existingSession) {
      throw new WorkoutSessionServiceError(
        "Workout session not found",
        "NOT_FOUND"
      );
    }

    const docRef = doc(db, WORKOUT_SESSIONS_COLLECTION, sessionId);
    await deleteDoc(docRef);
  } catch (error) {
    if (error instanceof WorkoutSessionServiceError) {
      throw error;
    }
    throw new WorkoutSessionServiceError(
      `Failed to delete workout session: ${error.message}`,
      "DELETE_FAILED"
    );
  }
}

export function subscribeToWorkoutSession(sessionId, userId, callback) {
  try {
    if (!sessionId) {
      throw new WorkoutSessionServiceError(
        "Session ID is required",
        "INVALID_SESSION_ID"
      );
    }

    if (!userId) {
      throw new WorkoutSessionServiceError(
        "User ID is required",
        "INVALID_USER_ID"
      );
    }

    if (typeof callback !== "function") {
      throw new WorkoutSessionServiceError(
        "Callback must be a function",
        "INVALID_CALLBACK"
      );
    }

    const docRef = doc(db, WORKOUT_SESSIONS_COLLECTION, sessionId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.userId !== userId) {
            callback(
              new WorkoutSessionServiceError(
                "Unauthorized access to workout session",
                "UNAUTHORIZED"
              ),
              null
            );
            return;
          }

          const session = workoutSessionFromFirestore(docSnap.id, data);
          callback(null, session);
        } else {
          callback(null, null);
        }
      },
      (error) => {
        callback(
          new WorkoutSessionServiceError(
            `Subscription error: ${error.message}`,
            "SUBSCRIPTION_ERROR"
          ),
          null
        );
      }
    );

    return unsubscribe;
  } catch (error) {
    if (error instanceof WorkoutSessionServiceError) {
      throw error;
    }
    throw new WorkoutSessionServiceError(
      `Failed to subscribe to workout session: ${error.message}`,
      "SUBSCRIBE_FAILED"
    );
  }
}

export async function getActiveWorkoutSession(userId) {
  try {
    if (!userId) {
      throw new WorkoutSessionServiceError(
        "User ID is required",
        "INVALID_USER_ID"
      );
    }

    const q = query(
      collection(db, WORKOUT_SESSIONS_COLLECTION),
      where("userId", "==", userId),
      where("status", "==", "active"),
      orderBy("startTime", "desc")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return workoutSessionFromFirestore(doc.id, doc.data());
  } catch (error) {
    if (error instanceof WorkoutSessionServiceError) {
      throw error;
    }
    throw new WorkoutSessionServiceError(
      `Failed to get active workout session: ${error.message}`,
      "GET_ACTIVE_SESSION_FAILED"
    );
  }
}

export const workoutSessionService = {
  createWorkoutSession,
  getWorkoutSession,
  getUserWorkoutSessions,
  updateWorkoutSession,
  deleteWorkoutSession,
  subscribeToWorkoutSession,
  getActiveWorkoutSession,
};
