import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "./useAuthContext.js";
import {
  createWorkoutSession as createSessionModel,
  validateWorkoutSession,
} from "../models/workoutModels.js";
import {
  createWorkoutSession,
  updateWorkoutSession,
  getWorkoutSession,
  subscribeToWorkoutSession,
} from "../services/workoutSessionService.js";

export function useActiveWorkout(planId, workoutPlan) {
  const { user } = useAuthContext();

  const [session, setSession] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const autoSaveTimerRef = useRef(null);
  const sessionIdRef = useRef(null);

  const startWorkout = useCallback(async () => {
    if (!user?.uid || !workoutPlan) {
      throw new Error("User and workout plan are required");
    }

    try {
      setLoading(true);
      setError(null);

      const newSession = createSessionModel(
        user.uid,
        planId,
        workoutPlan.name,
        {
          startTime: new Date(),
          status: "active",
          completedExercises: [],
        }
      );

      validateWorkoutSession(newSession);

      const sessionId = await createWorkoutSession(newSession);
      sessionIdRef.current = sessionId;

      setSession({ ...newSession, id: sessionId });
      setCurrentExerciseIndex(0);

      return sessionId;
    } catch (err) {
      console.error("Error starting workout:", err);
      setError(err.message || "Failed to start workout");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, planId, workoutPlan]);

  const saveSession = useCallback(
    async (sessionData) => {
      if (!sessionIdRef.current || !user?.uid) {
        return;
      }

      try {
        setIsSaving(true);
        await updateWorkoutSession(sessionIdRef.current, user.uid, sessionData);
      } catch (err) {
        console.error("Error saving session:", err);

      } finally {
        setIsSaving(false);
      }
    },
    [user?.uid]
  );

  useEffect(() => {
    if (!session || !sessionIdRef.current) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(() => {
      saveSession({
        completedExercises: session.completedExercises,
        status: session.status,
      });
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [session, saveSession]);

  const completeSet = useCallback(
    (setData) => {
      if (!session) {
        throw new Error("No active session");
      }

      const currentExercise = workoutPlan.exercises[currentExerciseIndex];
      if (!currentExercise) {
        throw new Error("Invalid exercise index");
      }

      setSession((prev) => {
        const updatedExercises = [...prev.completedExercises];
        const exerciseIndex = updatedExercises.findIndex(
          (ex) => ex.exerciseId === currentExercise.id
        );

        if (exerciseIndex >= 0) {

          updatedExercises[exerciseIndex].completedSets.push(setData);
        } else {

          updatedExercises.push({
            exerciseId: currentExercise.id,
            name: currentExercise.name,
            completedSets: [setData],
            skipped: false,
          });
        }

        return {
          ...prev,
          completedExercises: updatedExercises,
        };
      });
    },
    [session, workoutPlan, currentExerciseIndex]
  );

  const completeExercise = useCallback(
    (exerciseData) => {
      if (!session) {
        throw new Error("No active session");
      }

      setSession((prev) => {
        const updatedExercises = [...prev.completedExercises];
        const exerciseIndex = updatedExercises.findIndex(
          (ex) => ex.exerciseId === exerciseData.exerciseId
        );

        if (exerciseIndex >= 0) {

          updatedExercises[exerciseIndex] = exerciseData;
        } else {

          updatedExercises.push(exerciseData);
        }

        return {
          ...prev,
          completedExercises: updatedExercises,
        };
      });
    },
    [session]
  );

  const skipExercise = useCallback(
    (exerciseData) => {
      if (!session) {
        throw new Error("No active session");
      }

      completeExercise({
        ...exerciseData,
        skipped: true,
      });
    },
    [session, completeExercise]
  );

  const nextExercise = useCallback(() => {
    if (currentExerciseIndex < workoutPlan.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      return true;
    }
    return false;
  }, [currentExerciseIndex, workoutPlan]);

  const previousExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      return true;
    }
    return false;
  }, [currentExerciseIndex]);

  const pauseWorkout = useCallback(async () => {
    if (!session || !sessionIdRef.current) {
      throw new Error("No active session");
    }

    try {
      setLoading(true);
      const updatedSession = {
        ...session,
        status: "paused",
      };

      await saveSession({ status: "paused" });
      setSession(updatedSession);
    } catch (err) {
      console.error("Error pausing workout:", err);
      setError(err.message || "Failed to pause workout");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, saveSession]);

  const resumeWorkout = useCallback(async () => {
    if (!session || !sessionIdRef.current) {
      throw new Error("No active session");
    }

    try {
      setLoading(true);
      const updatedSession = {
        ...session,
        status: "active",
      };

      await saveSession({ status: "active" });
      setSession(updatedSession);
    } catch (err) {
      console.error("Error resuming workout:", err);
      setError(err.message || "Failed to resume workout");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, saveSession]);

  const calculateWorkoutMetrics = useCallback(() => {
    if (!session || !workoutPlan) {
      return null;
    }

    const endTime = new Date();
    const totalDuration = Math.round((endTime - session.startTime) / 1000 / 60);

    let totalVolume = 0;
    session.completedExercises.forEach((exercise) => {
      exercise.completedSets.forEach((set) => {
        const weight = set.weight || 0;
        totalVolume += weight * set.reps;
      });
    });

    const totalExercises = workoutPlan.exercises.length;
    const completedExercisesCount = session.completedExercises.filter(
      (ex) => !ex.skipped
    ).length;
    const completionRate =
      totalExercises > 0
        ? Math.round((completedExercisesCount / totalExercises) * 100)
        : 0;

    const totalSetsCompleted = session.completedExercises.reduce(
      (total, exercise) => {
        if (!exercise.skipped) {
          return total + exercise.completedSets.length;
        }
        return total;
      },
      0
    );

    const totalRepsCompleted = session.completedExercises.reduce(
      (total, exercise) => {
        if (!exercise.skipped) {
          return (
            total +
            exercise.completedSets.reduce(
              (setTotal, set) => setTotal + set.reps,
              0
            )
          );
        }
        return total;
      },
      0
    );

    return {
      endTime,
      totalDuration,
      totalVolume,
      completionRate,
      totalSetsCompleted,
      totalRepsCompleted,
      completedExercisesCount,
      skippedExercisesCount: session.completedExercises.filter(
        (ex) => ex.skipped
      ).length,
    };
  }, [session, workoutPlan]);

  const completeWorkout = useCallback(async () => {
    if (!session || !sessionIdRef.current) {
      throw new Error("No active session");
    }

    try {
      setLoading(true);

      const metrics = calculateWorkoutMetrics();
      if (!metrics) {
        throw new Error("Failed to calculate workout metrics");
      }

      const completedSession = {
        ...session,
        endTime: metrics.endTime,
        totalDuration: metrics.totalDuration,
        status: "completed",
        metrics: {
          totalVolume: metrics.totalVolume,
          completionRate: metrics.completionRate,
          totalSetsCompleted: metrics.totalSetsCompleted,
          totalRepsCompleted: metrics.totalRepsCompleted,
          completedExercisesCount: metrics.completedExercisesCount,
          skippedExercisesCount: metrics.skippedExercisesCount,
        },
      };

      await updateWorkoutSession(sessionIdRef.current, user.uid, {
        endTime: metrics.endTime,
        totalDuration: metrics.totalDuration,
        status: "completed",
        completedExercises: session.completedExercises,
        metrics: completedSession.metrics,
      });

      setSession(completedSession);
      return completedSession;
    } catch (err) {
      console.error("Error completing workout:", err);
      setError(err.message || "Failed to complete workout");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, user?.uid, calculateWorkoutMetrics]);

  const loadSession = useCallback(
    async (sessionId) => {
      if (!user?.uid) {
        throw new Error("User must be authenticated");
      }

      try {
        setLoading(true);
        setError(null);

        const existingSession = await getWorkoutSession(sessionId, user.uid);
        if (!existingSession) {
          throw new Error("Session not found");
        }

        sessionIdRef.current = sessionId;
        setSession(existingSession);

        const completedCount = existingSession.completedExercises.filter(
          (ex) => !ex.skipped
        ).length;
        setCurrentExerciseIndex(
          Math.min(completedCount, workoutPlan.exercises.length - 1)
        );
      } catch (err) {
        console.error("Error loading session:", err);
        setError(err.message || "Failed to load session");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.uid, workoutPlan]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  const currentExercise = workoutPlan?.exercises[currentExerciseIndex];

  const isWorkoutComplete =
    currentExerciseIndex >= (workoutPlan?.exercises.length || 0) - 1 &&
    session?.completedExercises.length === (workoutPlan?.exercises.length || 0);

  return {

    session,
    currentExercise,
    currentExerciseIndex,
    loading,
    error,
    isSaving,
    isWorkoutComplete,

    startWorkout,
    completeSet,
    completeExercise,
    skipExercise,
    nextExercise,
    previousExercise,
    pauseWorkout,
    resumeWorkout,
    completeWorkout,
    loadSession,
    clearError,
  };
}
