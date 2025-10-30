export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const calculateWorkoutDuration = (startTime, endTime) => {
  return Math.round((endTime - startTime) / (1000 * 60));
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const calculateWorkoutStats = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return {
      totalWorkouts: 0,
      currentStreak: 0,
      totalDuration: 0,
      averageDuration: 0,
      thisWeekWorkouts: 0,
      lastWeekWorkouts: 0,
    };
  }

  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  );

  const totalWorkouts = completedSessions.length;

  const totalDuration = completedSessions.reduce(
    (sum, session) => sum + (session.totalDuration || 0),
    0
  );

  const averageDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  const currentStreak = calculateWorkoutStreak(completedSessions);

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekWorkouts = completedSessions.filter((session) => {
    const sessionDate =
      session.startTime instanceof Date
        ? session.startTime
        : new Date(session.startTime);
    return sessionDate >= startOfWeek;
  }).length;

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const lastWeekWorkouts = completedSessions.filter((session) => {
    const sessionDate =
      session.startTime instanceof Date
        ? session.startTime
        : new Date(session.startTime);
    return sessionDate >= startOfLastWeek && sessionDate < startOfWeek;
  }).length;

  return {
    totalWorkouts,
    currentStreak,
    totalDuration,
    averageDuration,
    thisWeekWorkouts,
    lastWeekWorkouts,
  };
};

export const calculateWorkoutStreak = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return 0;
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA =
      a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
    const dateB =
      b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
    return dateB - dateA;
  });

  const workoutDates = new Set();
  sortedSessions.forEach((session) => {
    const date =
      session.startTime instanceof Date
        ? session.startTime
        : new Date(session.startTime);
    const dateStr = date.toISOString().split("T")[0];
    workoutDates.add(dateStr);
  });

  const uniqueDates = Array.from(workoutDates).sort().reverse();

  if (uniqueDates.length === 0) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const mostRecentDate = uniqueDates[0];

  if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(today);

  for (let i = 0; i < uniqueDates.length; i++) {
    const checkDateStr = currentDate.toISOString().split("T")[0];

    if (uniqueDates[i] === checkDateStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const getMotivationalMessage = (stats) => {
  const { totalWorkouts, currentStreak, thisWeekWorkouts } = stats;

  if (totalWorkouts === 0) {
    return "Start your fitness journey today! 💪";
  }

  if (currentStreak >= 7) {
    return `Amazing! ${currentStreak} day streak! Keep it up! 🔥`;
  }

  if (currentStreak >= 3) {
    return `Great job! ${currentStreak} days in a row! 🎯`;
  }

  if (thisWeekWorkouts >= 4) {
    return "You're crushing it this week! 💯";
  }

  if (thisWeekWorkouts >= 2) {
    return "Keep up the good work! 💪";
  }

  if (totalWorkouts >= 10) {
    return "You're building a great habit! 🌟";
  }

  return "Every workout counts! Keep going! 🚀";
};
