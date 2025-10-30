import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "./useAuthContext.js";
import {
  createWorkoutPlanService,
  getUserWorkoutPlans,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  subscribeToUserWorkoutPlans,
  WorkoutServiceError,
} from "../services/workoutService.js";

export function useWorkoutPlans(options = {}) {
  const { activeOnly = false, realtime = true } = options;
  const { user } = useAuthContext();

  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const fetchWorkoutPlans = useCallback(async () => {
    if (!user?.uid) {
      setWorkoutPlans([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const plans = await getUserWorkoutPlans(user.uid, { activeOnly });
      setWorkoutPlans(plans);
    } catch (err) {
      console.error("Error fetching workout plans:", err);
      setError(err.message || "Failed to fetch workout plans");
    } finally {
      setLoading(false);
    }
  }, [user?.uid, activeOnly]);

  const createPlan = useCallback(
    async (planData) => {
      if (!user?.uid) {
        throw new Error("User must be authenticated to create workout plans");
      }

      try {
        setOperationLoading(true);
        setError(null);

        const tempId = `temp-${Date.now()}`;
        const optimisticPlan = {
          id: tempId,
          userId: user.uid,
          name: planData.name,
          description: planData.description,
          exercises: planData.exercises || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: planData.isActive !== undefined ? planData.isActive : true,
          _optimistic: true,
        };

        setWorkoutPlans((prev) => [optimisticPlan, ...prev]);

        const planId = await createWorkoutPlanService(user.uid, planData);

        setWorkoutPlans((prev) =>
          prev.map((plan) =>
            plan.id === tempId
              ? { ...optimisticPlan, id: planId, _optimistic: false }
              : plan
          )
        );

        return planId;
      } catch (err) {
        console.error("Error creating workout plan:", err);

        setWorkoutPlans((prev) => prev.filter((plan) => !plan._optimistic));

        const errorMessage =
          err instanceof WorkoutServiceError
            ? err.message
            : "Failed to create workout plan";
        setError(errorMessage);
        throw err;
      } finally {
        setOperationLoading(false);
      }
    },
    [user?.uid]
  );

  const updatePlan = useCallback(
    async (planId, updates) => {
      if (!user?.uid) {
        throw new Error("User must be authenticated to update workout plans");
      }

      try {
        setOperationLoading(true);
        setError(null);

        const originalPlan = workoutPlans.find((plan) => plan.id === planId);
        if (!originalPlan) {
          throw new Error("Workout plan not found");
        }

        setWorkoutPlans((prev) =>
          prev.map((plan) =>
            plan.id === planId
              ? { ...plan, ...updates, updatedAt: new Date() }
              : plan
          )
        );

        await updateWorkoutPlan(planId, user.uid, updates);
      } catch (err) {
        console.error("Error updating workout plan:", err);

        setWorkoutPlans((prev) =>
          prev.map((plan) => (plan.id === planId ? originalPlan : plan))
        );

        const errorMessage =
          err instanceof WorkoutServiceError
            ? err.message
            : "Failed to update workout plan";
        setError(errorMessage);
        throw err;
      } finally {
        setOperationLoading(false);
      }
    },
    [user?.uid, workoutPlans]
  );

  const deletePlan = useCallback(
    async (planId) => {
      if (!user?.uid) {
        throw new Error("User must be authenticated to delete workout plans");
      }

      try {
        setOperationLoading(true);
        setError(null);

        const originalPlan = workoutPlans.find((plan) => plan.id === planId);
        if (!originalPlan) {
          throw new Error("Workout plan not found");
        }

        setWorkoutPlans((prev) => prev.filter((plan) => plan.id !== planId));

        await deleteWorkoutPlan(planId, user.uid);
      } catch (err) {
        console.error("Error deleting workout plan:", err);

        setWorkoutPlans((prev) => [originalPlan, ...prev]);

        const errorMessage =
          err instanceof WorkoutServiceError
            ? err.message
            : "Failed to delete workout plan";
        setError(errorMessage);
        throw err;
      } finally {
        setOperationLoading(false);
      }
    },
    [user?.uid, workoutPlans]
  );

  const togglePlanActive = useCallback(
    async (planId) => {
      const plan = workoutPlans.find((p) => p.id === planId);
      if (!plan) {
        throw new Error("Workout plan not found");
      }

      await updatePlan(planId, { isActive: !plan.isActive });
    },
    [workoutPlans, updatePlan]
  );

  const refresh = useCallback(() => {
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setWorkoutPlans([]);
      setLoading(false);
      return;
    }

    if (realtime) {

      setLoading(true);
      const unsubscribe = subscribeToUserWorkoutPlans(
        user.uid,
        (err, plans) => {
          if (err) {
            console.error("Error in workout plans subscription:", err);
            setError(err.message || "Failed to subscribe to workout plans");
            setLoading(false);
            return;
          }

          setWorkoutPlans(plans || []);
          setLoading(false);
          setError(null);
        },
        { activeOnly }
      );

      return () => {
        unsubscribe();
      };
    } else {

      fetchWorkoutPlans();
    }
  }, [user?.uid, activeOnly, realtime, fetchWorkoutPlans]);

  return {

    workoutPlans,
    loading,
    error,
    operationLoading,

    createPlan,
    updatePlan,
    deletePlan,
    togglePlanActive,
    refresh,
    clearError,
  };
}
