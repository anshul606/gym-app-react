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
  validateWorkoutPlan,
  workoutPlanToFirestore,
  workoutPlanFromFirestore,
  createWorkoutPlan,
} from "../models/workoutModels.js";

const WORKOUT_PLANS_COLLECTION = "workoutPlans";

export class WorkoutServiceError extends Error {
  constructor(message, code = "UNKNOWN_ERROR") {
    super(message);
    this.name = "WorkoutServiceError";
    this.code = code;
  }
}

export async function createWorkoutPlanService(userId, planData) {
  try {
    if (!userId) {
      throw new WorkoutServiceError("User ID is required", "INVALID_USER_ID");
    }

    const workoutPlan = createWorkoutPlan(userId, {
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    validateWorkoutPlan(workoutPlan);

    const firestoreData = workoutPlanToFirestore(workoutPlan);

    const dataToSave = {
      ...firestoreData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, WORKOUT_PLANS_COLLECTION),
      dataToSave
    );

    return docRef.id;
  } catch (error) {
    if (error instanceof WorkoutServiceError) {
      throw error;
    }
    throw new WorkoutServiceError(
      `Failed to create workout plan: ${error.message}`,
      "CREATE_FAILED"
    );
  }
}

export async function getWorkoutPlan(planId, userId) {
  try {
    if (!planId) {
      throw new WorkoutServiceError("Plan ID is required", "INVALID_PLAN_ID");
    }

    if (!userId) {
      throw new WorkoutServiceError("User ID is required", "INVALID_USER_ID");
    }

    const docRef = doc(db, WORKOUT_PLANS_COLLECTION, planId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();

    if (data.userId !== userId) {
      throw new WorkoutServiceError(
        "Unauthorized access to workout plan",
        "UNAUTHORIZED"
      );
    }

    return workoutPlanFromFirestore(docSnap.id, data);
  } catch (error) {
    if (error instanceof WorkoutServiceError) {
      throw error;
    }
    throw new WorkoutServiceError(
      `Failed to get workout plan: ${error.message}`,
      "GET_FAILED"
    );
  }
}

export async function getUserWorkoutPlans(userId, options = {}) {
  try {
    if (!userId) {
      throw new WorkoutServiceError("User ID is required", "INVALID_USER_ID");
    }

    const { activeOnly = false } = options;

    let q = query(
      collection(db, WORKOUT_PLANS_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    if (activeOnly) {
      q = query(
        collection(db, WORKOUT_PLANS_COLLECTION),
        where("userId", "==", userId),
        where("isActive", "==", true),
        orderBy("updatedAt", "desc")
      );
    }

    const querySnapshot = await getDocs(q);

    const workoutPlans = [];
    querySnapshot.forEach((doc) => {
      workoutPlans.push(workoutPlanFromFirestore(doc.id, doc.data()));
    });

    return workoutPlans;
  } catch (error) {
    if (error instanceof WorkoutServiceError) {
      throw error;
    }
    throw new WorkoutServiceError(
      `Failed to get user workout plans: ${error.message}`,
      "GET_USER_PLANS_FAILED"
    );
  }
}

export async function updateWorkoutPlan(planId, userId, updates) {
  try {
    if (!planId) {
      throw new WorkoutServiceError("Plan ID is required", "INVALID_PLAN_ID");
    }

    if (!userId) {
      throw new WorkoutServiceError("User ID is required", "INVALID_USER_ID");
    }

    const existingPlan = await getWorkoutPlan(planId, userId);

    if (!existingPlan) {
      throw new WorkoutServiceError("Workout plan not found", "NOT_FOUND");
    }

    const updatedPlan = {
      ...existingPlan,
      ...updates,
      updatedAt: new Date(),
    };

    validateWorkoutPlan(updatedPlan);

    const firestoreData = workoutPlanToFirestore(updatedPlan);

    const updateData = { ...firestoreData };
    delete updateData.createdAt;
    updateData.updatedAt = serverTimestamp();

    const docRef = doc(db, WORKOUT_PLANS_COLLECTION, planId);
    await updateDoc(docRef, updateData);
  } catch (error) {
    if (error instanceof WorkoutServiceError) {
      throw error;
    }
    throw new WorkoutServiceError(
      `Failed to update workout plan: ${error.message}`,
      "UPDATE_FAILED"
    );
  }
}

export async function deleteWorkoutPlan(planId, userId) {
  try {
    if (!planId) {
      throw new WorkoutServiceError("Plan ID is required", "INVALID_PLAN_ID");
    }

    if (!userId) {
      throw new WorkoutServiceError("User ID is required", "INVALID_USER_ID");
    }

    const existingPlan = await getWorkoutPlan(planId, userId);

    if (!existingPlan) {
      throw new WorkoutServiceError("Workout plan not found", "NOT_FOUND");
    }

    const docRef = doc(db, WORKOUT_PLANS_COLLECTION, planId);
    await deleteDoc(docRef);
  } catch (error) {
    if (error instanceof WorkoutServiceError) {
      throw error;
    }
    throw new WorkoutServiceError(
      `Failed to delete workout plan: ${error.message}`,
      "DELETE_FAILED"
    );
  }
}

export function subscribeToWorkoutPlan(planId, userId, callback) {
  try {
    if (!planId) {
      throw new WorkoutServiceError("Plan ID is required", "INVALID_PLAN_ID");
    }

    if (!userId) {
      throw new WorkoutServiceError("User ID is required", "INVALID_USER_ID");
    }

    if (typeof callback !== "function") {
      throw new WorkoutServiceError(
        "Callback must be a function",
        "INVALID_CALLBACK"
      );
    }

    const docRef = doc(db, WORKOUT_PLANS_COLLECTION, planId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.userId !== userId) {
            callback(
              new WorkoutServiceError(
                "Unauthorized access to workout plan",
                "UNAUTHORIZED"
              ),
              null
            );
            return;
          }

          const workoutPlan = workoutPlanFromFirestore(docSnap.id, data);
          callback(null, workoutPlan);
        } else {
          callback(null, null);
        }
      },
      (error) => {
        callback(
          new WorkoutServiceError(
            `Subscription error: ${error.message}`,
            "SUBSCRIPTION_ERROR"
          ),
          null
        );
      }
    );

    return unsubscribe;
  } catch (error) {
    if (error instanceof WorkoutServiceError) {
      throw error;
    }
    throw new WorkoutServiceError(
      `Failed to subscribe to workout plan: ${error.message}`,
      "SUBSCRIBE_FAILED"
    );
  }
}

export function subscribeToUserWorkoutPlans(userId, callback, options = {}) {
  try {
    if (!userId) {
      throw new WorkoutServiceError("User ID is required", "INVALID_USER_ID");
    }

    if (typeof callback !== "function") {
      throw new WorkoutServiceError(
        "Callback must be a function",
        "INVALID_CALLBACK"
      );
    }

    const { activeOnly = false } = options;

    let q = query(
      collection(db, WORKOUT_PLANS_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    if (activeOnly) {
      q = query(
        collection(db, WORKOUT_PLANS_COLLECTION),
        where("userId", "==", userId),
        where("isActive", "==", true),
        orderBy("updatedAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const workoutPlans = [];
        querySnapshot.forEach((doc) => {
          workoutPlans.push(workoutPlanFromFirestore(doc.id, doc.data()));
        });
        callback(null, workoutPlans);
      },
      (error) => {
        callback(
          new WorkoutServiceError(
            `Subscription error: ${error.message}`,
            "SUBSCRIPTION_ERROR"
          ),
          null
        );
      }
    );

    return unsubscribe;
  } catch (error) {
    if (error instanceof WorkoutServiceError) {
      throw error;
    }
    throw new WorkoutServiceError(
      `Failed to subscribe to user workout plans: ${error.message}`,
      "SUBSCRIBE_FAILED"
    );
  }
}

export async function toggleWorkoutPlanActive(planId, userId) {
  try {
    const plan = await getWorkoutPlan(planId, userId);

    if (!plan) {
      throw new WorkoutServiceError("Workout plan not found", "NOT_FOUND");
    }

    await updateWorkoutPlan(planId, userId, {
      isActive: !plan.isActive,
    });
  } catch (error) {
    if (error instanceof WorkoutServiceError) {
      throw error;
    }
    throw new WorkoutServiceError(
      `Failed to toggle workout plan active status: ${error.message}`,
      "TOGGLE_FAILED"
    );
  }
}

export const workoutService = {
  createWorkoutPlan: createWorkoutPlanService,
  getWorkoutPlan,
  getUserWorkoutPlans,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  subscribeToWorkoutPlan,
  subscribeToUserWorkoutPlans,
  toggleWorkoutPlanActive,
};
