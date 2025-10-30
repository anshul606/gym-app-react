import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export class ProgressServiceError extends Error {
  constructor(message, code = "UNKNOWN_ERROR") {
    super(message);
    this.name = "ProgressServiceError";
    this.code = code;
  }
}

export async function getLastWorkoutSession(userId, planId) {
  try {
    const sessionsRef = collection(db, "workoutSessions");
    const q = query(
      sessionsRef,
      where("userId", "==", userId),
      where("planId", "==", planId),
      where("status", "==", "completed"),
      orderBy("endTime", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error fetching last workout session:", error);
    return null;
  }
}

export async function getWorkoutSessionsInRange(userId, startDate, endDate) {
  try {
    if (!userId) {
      throw new ProgressServiceError("User ID is required", "INVALID_USER_ID");
    }

    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new ProgressServiceError(
        "Start date must be a valid Date",
        "INVALID_START_DATE"
      );
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new ProgressServiceError(
        "End date must be a valid Date",
        "INVALID_END_DATE"
      );
    }

    const sessionsRef = collection(db, "workoutSessions");
    const q = query(
      sessionsRef,
      where("userId", "==", userId),
      where("status", "==", "completed"),
      where("endTime", ">=", Timestamp.fromDate(startDate)),
      where("endTime", "<=", Timestamp.fromDate(endDate)),
      orderBy("endTime", "desc")
    );

    const snapshot = await getDocs(q);
    const sessions = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        ...data,
        startTime: data.startTime?.toDate
          ? data.startTime.toDate()
          : new Date(data.startTime),
        endTime: data.endTime?.toDate
          ? data.endTime.toDate()
          : new Date(data.endTime),
      });
    });

    return sessions;
  } catch (error) {
    if (error instanceof ProgressServiceError) {
      throw error;
    }
    throw new ProgressServiceError(
      `Failed to get workout sessions in range: ${error.message}`,
      "GET_SESSIONS_FAILED"
    );
  }
}

export async function getAllCompletedSessions(userId) {
  try {
    if (!userId) {
      throw new ProgressServiceError("User ID is required", "INVALID_USER_ID");
    }

    const sessionsRef = collection(db, "workoutSessions");
    const q = query(
      sessionsRef,
      where("userId", "==", userId),
      where("status", "==", "completed"),
      orderBy("endTime", "desc")
    );

    const snapshot = await getDocs(q);
    const sessions = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        ...data,
        startTime: data.startTime?.toDate
          ? data.startTime.toDate()
          : new Date(data.startTime),
        endTime: data.endTime?.toDate
          ? data.endTime.toDate()
          : new Date(data.endTime),
      });
    });

    return sessions;
  } catch (error) {
    if (error instanceof ProgressServiceError) {
      throw error;
    }
    throw new ProgressServiceError(
      `Failed to get all completed sessions: ${error.message}`,
      "GET_ALL_SESSIONS_FAILED"
    );
  }
}

export function getLastExercisePerformance(lastSession, exerciseId) {
  if (!lastSession || !lastSession.completedExercises) {
    return null;
  }

  const exercise = lastSession.completedExercises.find(
    (ex) => ex.exerciseId === exerciseId
  );

  if (
    !exercise ||
    !exercise.completedSets ||
    exercise.completedSets.length === 0
  ) {
    return null;
  }

  const lastSet = exercise.completedSets[exercise.completedSets.length - 1];

  return {
    reps: lastSet.reps,
    weight: lastSet.weight || 0,
  };
}

export function getSuggestedValues(lastPerformance, currentExercise) {
  if (!lastPerformance) {
    return {
      reps: currentExercise.reps,
      weight: currentExercise.weight || 0,
    };
  }

  return {
    reps: lastPerformance.reps,
    weight: lastPerformance.weight,
  };
}

export function getUpdatedExercisesFromSession(workoutPlan, completedSession) {
  if (!completedSession || !completedSession.completedExercises) {
    return workoutPlan.exercises;
  }

  return workoutPlan.exercises.map((exercise) => {
    const completedExercise = completedSession.completedExercises.find(
      (ex) => ex.exerciseId === exercise.id
    );

    if (
      !completedExercise ||
      completedExercise.skipped ||
      !completedExercise.completedSets ||
      completedExercise.completedSets.length === 0
    ) {
      return exercise;
    }

    const lastSet =
      completedExercise.completedSets[
        completedExercise.completedSets.length - 1
      ];

    return {
      ...exercise,
      reps: lastSet.reps,
      weight: lastSet.weight || exercise.weight || 0,
    };
  });
}

export function calculatePersonalRecords(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {};
  }

  const personalRecords = {};

  sessions.forEach((session) => {
    if (
      !session.completedExercises ||
      !Array.isArray(session.completedExercises)
    ) {
      return;
    }

    session.completedExercises.forEach((exercise) => {
      if (
        exercise.skipped ||
        !exercise.completedSets ||
        exercise.completedSets.length === 0
      ) {
        return;
      }

      const exerciseName = exercise.name;

      if (!personalRecords[exerciseName]) {
        personalRecords[exerciseName] = {
          exerciseName,
          maxWeight: 0,
          maxReps: 0,
          maxVolume: 0,
          maxWeightDate: null,
          maxRepsDate: null,
          maxVolumeDate: null,
        };
      }

      exercise.completedSets.forEach((set) => {
        const weight = set.weight || 0;
        const reps = set.reps || 0;
        const volume = weight * reps;
        const setDate = set.completedAt?.toDate
          ? set.completedAt.toDate()
          : set.completedAt instanceof Date
          ? set.completedAt
          : new Date(set.completedAt);

        if (weight > personalRecords[exerciseName].maxWeight) {
          personalRecords[exerciseName].maxWeight = weight;
          personalRecords[exerciseName].maxWeightDate = setDate;
        }

        if (reps > personalRecords[exerciseName].maxReps) {
          personalRecords[exerciseName].maxReps = reps;
          personalRecords[exerciseName].maxRepsDate = setDate;
        }

        if (volume > personalRecords[exerciseName].maxVolume) {
          personalRecords[exerciseName].maxVolume = volume;
          personalRecords[exerciseName].maxVolumeDate = setDate;
        }
      });
    });
  });

  return personalRecords;
}

export function detectNewPersonalRecords(session, existingPRs) {
  if (!session || !session.completedExercises) {
    return [];
  }

  const newRecords = [];

  session.completedExercises.forEach((exercise) => {
    if (
      exercise.skipped ||
      !exercise.completedSets ||
      exercise.completedSets.length === 0
    ) {
      return;
    }

    const exerciseName = exercise.name;
    const existingPR = existingPRs[exerciseName];

    exercise.completedSets.forEach((set) => {
      const weight = set.weight || 0;
      const reps = set.reps || 0;
      const volume = weight * reps;

      if (!existingPR || weight > existingPR.maxWeight) {
        newRecords.push({
          exerciseName,
          type: "weight",
          value: weight,
          previousValue: existingPR?.maxWeight || 0,
          date: set.completedAt,
        });
      }

      if (!existingPR || reps > existingPR.maxReps) {
        newRecords.push({
          exerciseName,
          type: "reps",
          value: reps,
          previousValue: existingPR?.maxReps || 0,
          date: set.completedAt,
        });
      }

      if (!existingPR || volume > existingPR.maxVolume) {
        newRecords.push({
          exerciseName,
          type: "volume",
          value: volume,
          previousValue: existingPR?.maxVolume || 0,
          date: set.completedAt,
        });
      }
    });
  });

  return newRecords;
}

export function calculateWorkoutFrequency(sessions, days = 30) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      totalWorkouts: 0,
      averagePerWeek: 0,
      averagePerMonth: 0,
      currentStreak: 0,
      longestStreak: 0,
      workoutDays: [],
    };
  }

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const recentSessions = sessions.filter((session) => {
    const sessionDate =
      session.endTime instanceof Date
        ? session.endTime
        : new Date(session.endTime);
    return sessionDate >= cutoffDate;
  });

  const workoutDaysSet = new Set();
  recentSessions.forEach((session) => {
    const sessionDate =
      session.endTime instanceof Date
        ? session.endTime
        : new Date(session.endTime);
    const dateString = sessionDate.toISOString().split("T")[0];
    workoutDaysSet.add(dateString);
  });

  const workoutDays = Array.from(workoutDaysSet).sort();
  const totalWorkouts = recentSessions.length;

  const weeksInPeriod = days / 7;
  const monthsInPeriod = days / 30;
  const averagePerWeek = totalWorkouts / weeksInPeriod;
  const averagePerMonth = totalWorkouts / monthsInPeriod;

  const { currentStreak, longestStreak } = calculateStreaks(workoutDays, now);

  return {
    totalWorkouts,
    averagePerWeek: Math.round(averagePerWeek * 10) / 10,
    averagePerMonth: Math.round(averagePerMonth * 10) / 10,
    currentStreak,
    longestStreak,
    workoutDays,
  };
}

function calculateStreaks(workoutDays, referenceDate) {
  if (workoutDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDays = [...workoutDays].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = referenceDate.toISOString().split("T")[0];
  const yesterday = new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  let checkDate = sortedDays[0] === today ? today : yesterday;
  let checkDateTime = new Date(checkDate);

  for (let i = 0; i < sortedDays.length; i++) {
    const workoutDate = sortedDays[i];

    if (workoutDate === checkDate.split("T")[0]) {
      currentStreak++;

      checkDateTime = new Date(checkDateTime.getTime() - 24 * 60 * 60 * 1000);
      checkDate = checkDateTime.toISOString().split("T")[0];
    } else {
      break;
    }
  }

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = new Date(sortedDays[i]);
      const previousDate = new Date(sortedDays[i - 1]);
      const dayDiff = Math.floor(
        (previousDate - currentDate) / (24 * 60 * 60 * 1000)
      );

      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

export function calculateConsistencyMetrics(sessions, days = 30) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      consistencyScore: 0,
      workoutDaysPercentage: 0,
      averageDaysBetweenWorkouts: 0,
      mostActiveDay: null,
      leastActiveDay: null,
    };
  }

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const recentSessions = sessions.filter((session) => {
    const sessionDate =
      session.endTime instanceof Date
        ? session.endTime
        : new Date(session.endTime);
    return sessionDate >= cutoffDate;
  });

  if (recentSessions.length === 0) {
    return {
      consistencyScore: 0,
      workoutDaysPercentage: 0,
      averageDaysBetweenWorkouts: 0,
      mostActiveDay: null,
      leastActiveDay: null,
    };
  }

  const workoutDaysSet = new Set();
  const dayOfWeekCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  recentSessions.forEach((session) => {
    const sessionDate =
      session.endTime instanceof Date
        ? session.endTime
        : new Date(session.endTime);
    const dateString = sessionDate.toISOString().split("T")[0];
    workoutDaysSet.add(dateString);

    const dayOfWeek = sessionDate.getDay();
    dayOfWeekCounts[dayOfWeek]++;
  });

  const uniqueWorkoutDays = workoutDaysSet.size;
  const workoutDaysPercentage = (uniqueWorkoutDays / days) * 100;

  const workoutDays = Array.from(workoutDaysSet).sort();
  let totalDaysBetween = 0;
  for (let i = 1; i < workoutDays.length; i++) {
    const date1 = new Date(workoutDays[i - 1]);
    const date2 = new Date(workoutDays[i]);
    const daysDiff = Math.floor((date2 - date1) / (24 * 60 * 60 * 1000));
    totalDaysBetween += daysDiff;
  }
  const averageDaysBetweenWorkouts =
    workoutDays.length > 1 ? totalDaysBetween / (workoutDays.length - 1) : 0;

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let mostActiveDay = null;
  let leastActiveDay = null;
  let maxCount = -1;
  let minCount = Infinity;

  Object.entries(dayOfWeekCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostActiveDay = dayNames[parseInt(day)];
    }
    if (count < minCount && count > 0) {
      minCount = count;
      leastActiveDay = dayNames[parseInt(day)];
    }
  });

  const targetWorkoutsPerWeek = 3;
  const actualWorkoutsPerWeek = (recentSessions.length / days) * 7;
  const frequencyScore = Math.min(
    (actualWorkoutsPerWeek / targetWorkoutsPerWeek) * 100,
    100
  );

  const regularityScore =
    averageDaysBetweenWorkouts > 0
      ? Math.max(0, 100 - averageDaysBetweenWorkouts * 10)
      : 0;

  const consistencyScore = Math.round((frequencyScore + regularityScore) / 2);

  return {
    consistencyScore,
    workoutDaysPercentage: Math.round(workoutDaysPercentage * 10) / 10,
    averageDaysBetweenWorkouts:
      Math.round(averageDaysBetweenWorkouts * 10) / 10,
    mostActiveDay,
    leastActiveDay,
  };
}

export function calculateSessionVolume(session) {
  if (!session || !session.completedExercises) {
    return 0;
  }

  let totalVolume = 0;

  session.completedExercises.forEach((exercise) => {
    if (exercise.skipped || !exercise.completedSets) {
      return;
    }

    exercise.completedSets.forEach((set) => {
      const weight = set.weight || 0;
      const reps = set.reps || 0;
      totalVolume += weight * reps;
    });
  });

  return totalVolume;
}

export function calculateVolumeTrends(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return [];
  }

  const volumeData = sessions.map((session) => {
    const sessionDate =
      session.endTime instanceof Date
        ? session.endTime
        : new Date(session.endTime);

    return {
      date: sessionDate,
      volume: calculateSessionVolume(session),
      planName: session.planName,
    };
  });

  return volumeData.sort((a, b) => a.date - b.date);
}

export async function getProgressAnalytics(userId, days = 30) {
  try {
    if (!userId) {
      throw new ProgressServiceError("User ID is required", "INVALID_USER_ID");
    }

    const allSessions = await getAllCompletedSessions(userId);

    if (allSessions.length === 0) {
      return {
        personalRecords: {},
        frequency: calculateWorkoutFrequency([], days),
        consistency: calculateConsistencyMetrics([], days),
        volumeTrends: [],
        totalWorkouts: 0,
        totalVolume: 0,
      };
    }

    const personalRecords = calculatePersonalRecords(allSessions);

    const frequency = calculateWorkoutFrequency(allSessions, days);

    const consistency = calculateConsistencyMetrics(allSessions, days);

    const volumeTrends = calculateVolumeTrends(allSessions);

    const totalWorkouts = allSessions.length;
    const totalVolume = allSessions.reduce(
      (sum, session) => sum + calculateSessionVolume(session),
      0
    );

    return {
      personalRecords,
      frequency,
      consistency,
      volumeTrends,
      totalWorkouts,
      totalVolume: Math.round(totalVolume),
    };
  } catch (error) {
    if (error instanceof ProgressServiceError) {
      throw error;
    }
    throw new ProgressServiceError(
      `Failed to get progress analytics: ${error.message}`,
      "GET_ANALYTICS_FAILED"
    );
  }
}
