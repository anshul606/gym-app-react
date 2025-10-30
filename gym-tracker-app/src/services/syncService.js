import {
  getPendingWorkouts,
  removePendingWorkout,
  incrementSyncAttempt,
  getSyncQueue,
  removeFromSyncQueue,
} from "../utils/offlineStorage";
import { saveWorkoutSession } from "./workoutSessionService";

export async function syncPendingWorkouts(userId) {
  const pending = getPendingWorkouts();
  const results = {
    success: [],
    failed: [],
  };

  for (const workout of pending) {
    try {

      await saveWorkoutSession(userId, workout);

      removePendingWorkout(workout.id);
      results.success.push(workout.id);

      console.log(`Successfully synced workout: ${workout.id}`);
    } catch (error) {
      console.error(`Failed to sync workout ${workout.id}:`, error);

      incrementSyncAttempt(workout.id);
      results.failed.push({
        id: workout.id,
        error: error.message,
      });

      if (workout.syncAttempts >= 5) {
        console.warn(`Workout ${workout.id} has failed 5+ sync attempts`);
      }
    }
  }

  return results;
}

export async function processSyncQueue(userId) {
  const queue = getSyncQueue();
  const results = {
    success: [],
    failed: [],
  };

  for (const operation of queue) {
    try {

      switch (operation.type) {
        case "workout_session":
          await saveWorkoutSession(userId, operation.data);
          break;

        default:
          console.warn(`Unknown operation type: ${operation.type}`);
      }

      removeFromSyncQueue(operation.id);
      results.success.push(operation.id);
    } catch (error) {
      console.error(`Failed to process sync operation ${operation.id}:`, error);
      results.failed.push({
        id: operation.id,
        error: error.message,
      });
    }
  }

  return results;
}

export async function performFullSync(userId) {
  console.log("Starting full synchronization...");

  try {

    const workoutResults = await syncPendingWorkouts(userId);

    const queueResults = await processSyncQueue(userId);

    const totalSuccess =
      workoutResults.success.length + queueResults.success.length;
    const totalFailed =
      workoutResults.failed.length + queueResults.failed.length;

    console.log(
      `Sync complete: ${totalSuccess} succeeded, ${totalFailed} failed`
    );

    return {
      success: totalSuccess > 0,
      workoutResults,
      queueResults,
      summary: {
        totalSuccess,
        totalFailed,
      },
    };
  } catch (error) {
    console.error("Full sync failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
