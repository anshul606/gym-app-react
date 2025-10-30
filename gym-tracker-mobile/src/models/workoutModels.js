export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateExercise(exercise) {
  if (!exercise || typeof exercise !== "object") {
    throw new ValidationError("Exercise must be an object");
  }

  if (
    !exercise.name ||
    typeof exercise.name !== "string" ||
    exercise.name.trim() === ""
  ) {
    throw new ValidationError(
      "Exercise name is required and must be a non-empty string"
    );
  }

  if (
    typeof exercise.sets !== "number" ||
    exercise.sets < 1 ||
    !Number.isInteger(exercise.sets)
  ) {
    throw new ValidationError("Sets must be a positive integer");
  }

  if (
    typeof exercise.reps !== "number" ||
    exercise.reps < 1 ||
    !Number.isInteger(exercise.reps)
  ) {
    throw new ValidationError("Reps must be a positive integer");
  }

  if (exercise.weight !== undefined && exercise.weight !== null) {
    if (typeof exercise.weight !== "number" || exercise.weight < 0) {
      throw new ValidationError("Weight must be a non-negative number");
    }
  }

  if (
    typeof exercise.restTime !== "number" ||
    exercise.restTime < 0 ||
    !Number.isInteger(exercise.restTime)
  ) {
    throw new ValidationError(
      "Rest time must be a non-negative integer (seconds)"
    );
  }

  if (
    exercise.notes !== undefined &&
    exercise.notes !== null &&
    typeof exercise.notes !== "string"
  ) {
    throw new ValidationError("Notes must be a string");
  }

  if (!Array.isArray(exercise.muscleGroups)) {
    throw new ValidationError("Muscle groups must be an array");
  }

  if (exercise.muscleGroups.some((group) => typeof group !== "string")) {
    throw new ValidationError("All muscle groups must be strings");
  }

  return true;
}

export function validateWorkoutPlan(plan) {
  if (!plan || typeof plan !== "object") {
    throw new ValidationError("Workout plan must be an object");
  }

  if (
    !plan.userId ||
    typeof plan.userId !== "string" ||
    plan.userId.trim() === ""
  ) {
    throw new ValidationError(
      "User ID is required and must be a non-empty string"
    );
  }

  if (!plan.name || typeof plan.name !== "string" || plan.name.trim() === "") {
    throw new ValidationError(
      "Workout plan name is required and must be a non-empty string"
    );
  }

  if (
    plan.description !== undefined &&
    plan.description !== null &&
    typeof plan.description !== "string"
  ) {
    throw new ValidationError("Description must be a string");
  }

  if (!Array.isArray(plan.exercises)) {
    throw new ValidationError("Exercises must be an array");
  }

  if (plan.exercises.length === 0) {
    throw new ValidationError(
      "Workout plan must contain at least one exercise"
    );
  }

  plan.exercises.forEach((exercise, index) => {
    try {
      validateExercise(exercise);
    } catch (error) {
      throw new ValidationError(`Exercise at index ${index}: ${error.message}`);
    }
  });

  if (typeof plan.isActive !== "boolean") {
    throw new ValidationError("isActive must be a boolean");
  }

  return true;
}

export function validateWorkoutSession(session) {
  if (!session || typeof session !== "object") {
    throw new ValidationError("Workout session must be an object");
  }

  if (
    !session.userId ||
    typeof session.userId !== "string" ||
    session.userId.trim() === ""
  ) {
    throw new ValidationError(
      "User ID is required and must be a non-empty string"
    );
  }

  if (
    !session.planId ||
    typeof session.planId !== "string" ||
    session.planId.trim() === ""
  ) {
    throw new ValidationError(
      "Plan ID is required and must be a non-empty string"
    );
  }

  if (
    !session.planName ||
    typeof session.planName !== "string" ||
    session.planName.trim() === ""
  ) {
    throw new ValidationError(
      "Plan name is required and must be a non-empty string"
    );
  }

  if (
    !(session.startTime instanceof Date) ||
    isNaN(session.startTime.getTime())
  ) {
    throw new ValidationError("Start time must be a valid Date object");
  }

  if (session.endTime !== undefined && session.endTime !== null) {
    if (
      !(session.endTime instanceof Date) ||
      isNaN(session.endTime.getTime())
    ) {
      throw new ValidationError("End time must be a valid Date object");
    }
    if (session.endTime < session.startTime) {
      throw new ValidationError("End time cannot be before start time");
    }
  }

  if (!Array.isArray(session.completedExercises)) {
    throw new ValidationError("Completed exercises must be an array");
  }

  if (session.totalDuration !== undefined && session.totalDuration !== null) {
    if (
      typeof session.totalDuration !== "number" ||
      session.totalDuration < 0
    ) {
      throw new ValidationError("Total duration must be a non-negative number");
    }
  }

  const validStatuses = ["active", "completed", "paused"];
  if (!validStatuses.includes(session.status)) {
    throw new ValidationError(
      `Status must be one of: ${validStatuses.join(", ")}`
    );
  }

  return true;
}

export function workoutPlanToFirestore(plan) {
  return {
    userId: plan.userId,
    name: plan.name,
    description: plan.description || null,
    exercises: plan.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight ?? null,
      restTime: exercise.restTime,
      notes: exercise.notes || null,
      muscleGroups: exercise.muscleGroups,
    })),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    isActive: plan.isActive,
  };
}

export function workoutPlanFromFirestore(id, data) {
  return {
    id,
    userId: data.userId,
    name: data.name,
    description: data.description || undefined,
    exercises: data.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight ?? undefined,
      restTime: exercise.restTime,
      notes: exercise.notes || undefined,
      muscleGroups: exercise.muscleGroups || [],
    })),
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate()
      : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate
      ? data.updatedAt.toDate()
      : new Date(data.updatedAt),
    isActive: data.isActive,
  };
}

export function workoutSessionToFirestore(session) {
  return {
    userId: session.userId,
    planId: session.planId,
    planName: session.planName,
    startTime: session.startTime,
    endTime: session.endTime || null,
    completedExercises: session.completedExercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      completedSets: exercise.completedSets.map((set) => ({
        reps: set.reps,
        weight: set.weight ?? null,
        completedAt: set.completedAt,
        restDuration: set.restDuration ?? null,
      })),
      skipped: exercise.skipped,
    })),
    totalDuration: session.totalDuration ?? null,
    status: session.status,
    metrics: session.metrics || null,
  };
}

export function workoutSessionFromFirestore(id, data) {
  return {
    id,
    userId: data.userId,
    planId: data.planId,
    planName: data.planName,
    startTime: data.startTime?.toDate
      ? data.startTime.toDate()
      : new Date(data.startTime),
    endTime: data.endTime?.toDate
      ? data.endTime.toDate()
      : data.endTime
      ? new Date(data.endTime)
      : undefined,
    completedExercises: data.completedExercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      completedSets: exercise.completedSets.map((set) => ({
        reps: set.reps,
        weight: set.weight ?? undefined,
        completedAt: set.completedAt?.toDate
          ? set.completedAt.toDate()
          : new Date(set.completedAt),
        restDuration: set.restDuration ?? undefined,
      })),
      skipped: exercise.skipped,
    })),
    totalDuration: data.totalDuration ?? undefined,
    status: data.status,
    metrics: data.metrics ?? undefined,
  };
}

export function createExercise(exerciseData = {}) {
  return {
    id: exerciseData.id || crypto.randomUUID(),
    name: exerciseData.name || "",
    sets: exerciseData.sets || 3,
    reps: exerciseData.reps || 10,
    weight: exerciseData.weight,
    restTime: exerciseData.restTime || 60,
    notes: exerciseData.notes,
    muscleGroups: exerciseData.muscleGroups || [],
  };
}

export function createWorkoutPlan(userId, planData = {}) {
  const now = new Date();
  return {
    id: planData.id || crypto.randomUUID(),
    userId,
    name: planData.name || "",
    description: planData.description,
    exercises: planData.exercises || [],
    createdAt: planData.createdAt || now,
    updatedAt: planData.updatedAt || now,
    isActive: planData.isActive !== undefined ? planData.isActive : true,
  };
}

export function createWorkoutSession(
  userId,
  planId,
  planName,
  sessionData = {}
) {
  return {
    id: sessionData.id || crypto.randomUUID(),
    userId,
    planId,
    planName,
    startTime: sessionData.startTime || new Date(),
    endTime: sessionData.endTime,
    completedExercises: sessionData.completedExercises || [],
    totalDuration: sessionData.totalDuration,
    status: sessionData.status || "active",
  };
}
