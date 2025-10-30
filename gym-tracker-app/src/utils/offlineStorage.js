const STORAGE_KEYS = {
  ACTIVE_WORKOUT: "activeWorkoutSession",
  PENDING_WORKOUTS: "pendingWorkoutSessions",
  WORKOUT_PLANS: "cachedWorkoutPlans",
  USER_PREFERENCES: "userPreferences",
  SYNC_QUEUE: "syncQueue",
};

export function saveActiveWorkoutOffline(sessionData) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_WORKOUT,
      JSON.stringify({
        ...sessionData,
        savedAt: new Date().toISOString(),
        isOffline: true,
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to save workout offline:", error);
    return false;
  }
}

export function getActiveWorkoutOffline() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to retrieve offline workout:", error);
    return null;
  }
}

export function clearActiveWorkoutOffline() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    return true;
  } catch (error) {
    console.error("Failed to clear offline workout:", error);
    return false;
  }
}

export function addToPendingSync(workoutData) {
  try {
    const pending = getPendingWorkouts();
    pending.push({
      ...workoutData,
      pendingSince: new Date().toISOString(),
      syncAttempts: 0,
    });
    localStorage.setItem(
      STORAGE_KEYS.PENDING_WORKOUTS,
      JSON.stringify(pending)
    );
    return true;
  } catch (error) {
    console.error("Failed to add workout to pending sync:", error);
    return false;
  }
}

export function getPendingWorkouts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_WORKOUTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to retrieve pending workouts:", error);
    return [];
  }
}

export function removePendingWorkout(workoutId) {
  try {
    const pending = getPendingWorkouts();
    const filtered = pending.filter((w) => w.id !== workoutId);
    localStorage.setItem(
      STORAGE_KEYS.PENDING_WORKOUTS,
      JSON.stringify(filtered)
    );
    return true;
  } catch (error) {
    console.error("Failed to remove pending workout:", error);
    return false;
  }
}

export function incrementSyncAttempt(workoutId) {
  try {
    const pending = getPendingWorkouts();
    const updated = pending.map((w) =>
      w.id === workoutId
        ? {
            ...w,
            syncAttempts: (w.syncAttempts || 0) + 1,
            lastAttempt: new Date().toISOString(),
          }
        : w
    );
    localStorage.setItem(
      STORAGE_KEYS.PENDING_WORKOUTS,
      JSON.stringify(updated)
    );
    return true;
  } catch (error) {
    console.error("Failed to increment sync attempt:", error);
    return false;
  }
}

export function cacheWorkoutPlans(plans) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.WORKOUT_PLANS,
      JSON.stringify({
        plans,
        cachedAt: new Date().toISOString(),
      })
    );
    return true;
  } catch (error) {
    console.error("Failed to cache workout plans:", error);
    return false;
  }
}

export function getCachedWorkoutPlans() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_PLANS);
    if (!data) return null;

    const cached = JSON.parse(data);

    const cacheAge = Date.now() - new Date(cached.cachedAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000;

    if (cacheAge > maxAge) {
      return null;
    }

    return cached.plans;
  } catch (error) {
    console.error("Failed to retrieve cached workout plans:", error);
    return null;
  }
}

export function addToSyncQueue(operation) {
  try {
    const queue = getSyncQueue();
    queue.push({
      ...operation,
      id: `${operation.type}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      attempts: 0,
    });
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error("Failed to add to sync queue:", error);
    return false;
  }
}

export function getSyncQueue() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to retrieve sync queue:", error);
    return [];
  }
}

export function removeFromSyncQueue(operationId) {
  try {
    const queue = getSyncQueue();
    const filtered = queue.filter((op) => op.id !== operationId);
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to remove from sync queue:", error);
    return false;
  }
}

export function clearSyncQueue() {
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    return true;
  } catch (error) {
    console.error("Failed to clear sync queue:", error);
    return false;
  }
}

export function getStorageInfo() {
  try {
    const activeWorkout = getActiveWorkoutOffline();
    const pendingWorkouts = getPendingWorkouts();
    const cachedPlans = getCachedWorkoutPlans();
    const syncQueue = getSyncQueue();

    return {
      hasActiveWorkout: !!activeWorkout,
      pendingCount: pendingWorkouts.length,
      cachedPlansCount: cachedPlans?.length || 0,
      syncQueueCount: syncQueue.length,
    };
  } catch (error) {
    console.error("Failed to get storage info:", error);
    return {
      hasActiveWorkout: false,
      pendingCount: 0,
      cachedPlansCount: 0,
      syncQueueCount: 0,
    };
  }
}

export const STORAGE_KEYS_EXPORT = STORAGE_KEYS;
