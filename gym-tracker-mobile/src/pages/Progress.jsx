import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import useSwipeGesture from "../hooks/useSwipeGesture";
import { getProgressAnalytics } from "../services/progressService";
import ProgressChart from "../components/progress/ProgressChart";
import StatCard from "../components/common/StatCard";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Progress = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(30);

  const pages = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/workout-plans", name: "Workout Plans" },
    { path: "/progress", name: "Progress" },
    { path: "/profile", name: "Profile" },
  ];
  const currentPageIndex = 2;

  const handleSwipeLeft = () => {
    if (currentPageIndex < pages.length - 1) {
      navigate(pages[currentPageIndex + 1].path);
    }
  };

  const handleSwipeRight = () => {
    if (currentPageIndex > 0) {
      navigate(pages[currentPageIndex - 1].path);
    }
  };

  const { ref: swipeRef } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 75,
    maxSwipeTime: 400,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getProgressAnalytics(user.uid, selectedTimeRange);
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching progress analytics:", err);
        setError("Failed to load progress data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, selectedTimeRange]);

  const handleTimeRangeChange = (days) => {
    setSelectedTimeRange(days);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-6 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-[var(--text-primary)] mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalWorkouts === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] safe-area-bottom">
        <div
          ref={swipeRef}
          className="container mx-auto px-4 py-8 pb-32 md:pb-8"
        >
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
            Progress
          </h1>
          <div className="card p-12 text-center">
            <svg
              className="w-20 h-20 mx-auto mb-6 text-[var(--text-secondary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              No Progress Data Yet
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
              Complete your first workout to start tracking your progress and
              see your improvements over time!
            </p>
            <a href="/workout-plans" className="btn-primary inline-block">
              Start a Workout
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { personalRecords, frequency, consistency, volumeTrends } = analytics;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] safe-area-bottom">
      <div
        ref={swipeRef}
        className="container mx-auto px-4 py-8 pb-32 md:pb-8 container-safe"
      >
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Progress
          </h1>
          <p className="text-[var(--text-secondary)]">
            Track your fitness journey and celebrate your achievements
          </p>
        </div>

        {}
        <MotivationalBanner
          frequency={frequency}
          consistency={consistency}
          totalWorkouts={analytics.totalWorkouts}
        />

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            value={analytics.totalWorkouts}
            label="Total Workouts"
            color="primary"
          />
          <StatCard
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            value={frequency.currentStreak}
            label="Current Streak (days)"
            trend={frequency.currentStreak > 0 ? "positive" : "neutral"}
            trendLabel={
              frequency.currentStreak > 0 ? "Keep it up!" : "Start a new streak"
            }
            color="secondary"
          />
          <StatCard
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            }
            value={Object.keys(personalRecords).length}
            label="Personal Records"
            color="purple"
          />
          <StatCard
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            value={`${consistency.consistencyScore}%`}
            label="Consistency Score"
            trend={
              consistency.consistencyScore >= 70
                ? "positive"
                : consistency.consistencyScore >= 40
                ? "neutral"
                : "negative"
            }
            trendLabel={
              consistency.consistencyScore >= 70
                ? "Excellent!"
                : consistency.consistencyScore >= 40
                ? "Good progress"
                : "Room to improve"
            }
            color="orange"
          />
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProgressChart
            data={volumeTrends}
            metric="frequency"
            onTimeRangeChange={handleTimeRangeChange}
          />
          <ProgressChart
            data={volumeTrends}
            metric="volume"
            onTimeRangeChange={handleTimeRangeChange}
          />
        </div>

        {}
        <WorkoutCalendar workoutDays={frequency.workoutDays} />

        {}
        <PersonalRecordsList personalRecords={personalRecords} />
      </div>
    </div>
  );
};

export default Progress;

const MotivationalBanner = ({ frequency, consistency, totalWorkouts }) => {

  const getMessage = () => {
    if (frequency.currentStreak >= 7) {
      return {
        title: "🔥 You're on Fire!",
        message: `${frequency.currentStreak} day streak! You're crushing it!`,
        color: "bg-gradient-to-r from-orange-500 to-red-500",
      };
    } else if (frequency.currentStreak >= 3) {
      return {
        title: "💪 Great Momentum!",
        message: `${frequency.currentStreak} day streak. Keep pushing forward!`,
        color: "bg-gradient-to-r from-blue-500 to-purple-500",
      };
    } else if (consistency.consistencyScore >= 70) {
      return {
        title: "⭐ Excellent Consistency!",
        message: `${consistency.consistencyScore}% consistency score. You're building great habits!`,
        color: "bg-gradient-to-r from-green-500 to-teal-500",
      };
    } else if (totalWorkouts >= 10) {
      return {
        title: "🎯 Making Progress!",
        message: `${totalWorkouts} workouts completed. Every rep counts!`,
        color: "bg-gradient-to-r from-indigo-500 to-blue-500",
      };
    } else {
      return {
        title: "🚀 Getting Started!",
        message: "You're on your way to greatness. Keep showing up!",
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
      };
    }
  };

  const { title, message, color } = getMessage();

  return (
    <div className={`${color} rounded-lg p-6 mb-8 text-white shadow-lg`}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">{title}</h2>
          <p className="text-white/90">{message}</p>
        </div>
        <div className="hidden sm:block">
          <svg
            className="w-16 h-16 opacity-50"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const WorkoutCalendar = ({ workoutDays }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const generateCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendar = [];
    let week = new Array(7).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];
      const hasWorkout = workoutDays.includes(dateString);
      const dayOfWeek = (startingDayOfWeek + day - 1) % 7;

      week[dayOfWeek] = {
        day,
        date: dateString,
        hasWorkout,
        isToday: dateString === new Date().toISOString().split("T")[0],
      };

      if (dayOfWeek === 6 || day === daysInMonth) {
        calendar.push([...week]);
        week = new Array(7).fill(null);
      }
    }

    return calendar;
  };

  const calendar = generateCalendar();
  const monthName = selectedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const goToPreviousMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1)
    );
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  return (
    <div className="card p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Workout Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors touch-manipulation touch-active min-w-[44px] min-h-[44px]"
            aria-label="Previous month"
          >
            <svg
              className="w-5 h-5 text-[var(--text-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToCurrentMonth}
            className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors touch-manipulation touch-active min-h-[44px]"
          >
            {monthName}
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors touch-manipulation touch-active min-w-[44px] min-h-[44px]"
            aria-label="Next month"
          >
            <svg
              className="w-5 h-5 text-[var(--text-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-7 gap-2">
        {}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-[var(--text-secondary)] py-2"
          >
            {day}
          </div>
        ))}

        {}
        {calendar.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm min-h-[44px] touch-manipulation ${
                day
                  ? day.hasWorkout
                    ? "bg-[var(--accent-secondary)] text-white font-bold shadow-sm"
                    : day.isToday
                    ? "bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)] font-medium border-2 border-[var(--accent-primary)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  : ""
              } transition-colors`}
            >
              {day?.day}
            </div>
          ))
        )}
      </div>

      {}
      <div className="flex items-center justify-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--accent-secondary)]"></div>
          <span className="text-[var(--text-secondary)]">Workout Day</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-[var(--accent-primary)] bg-[var(--accent-primary)] bg-opacity-10"></div>
          <span className="text-[var(--text-secondary)]">Today</span>
        </div>
      </div>
    </div>
  );
};

const PersonalRecordsList = ({ personalRecords }) => {
  const [sortBy, setSortBy] = useState("exercise");
  const [filterText, setFilterText] = useState("");

  const recordsArray = Object.values(personalRecords);

  const filteredRecords = recordsArray.filter((record) =>
    record.exerciseName.toLowerCase().includes(filterText.toLowerCase())
  );

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    switch (sortBy) {
      case "exercise":
        return a.exerciseName.localeCompare(b.exerciseName);
      case "weight":
        return b.maxWeight - a.maxWeight;
      case "reps":
        return b.maxReps - a.maxReps;
      case "volume":
        return b.maxVolume - a.maxVolume;
      default:
        return 0;
    }
  });

  if (recordsArray.length === 0) {
    return (
      <div className="card p-8 text-center">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          No Personal Records Yet
        </h3>
        <p className="text-[var(--text-secondary)]">
          Complete workouts with weights to start tracking your personal bests!
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Personal Records
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {}
          <input
            type="text"
            placeholder="Search exercises..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="input-field text-sm"
          />

          {}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-sm"
          >
            <option value="exercise">Sort by Exercise</option>
            <option value="weight">Sort by Max Weight</option>
            <option value="reps">Sort by Max Reps</option>
            <option value="volume">Sort by Max Volume</option>
          </select>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedRecords.map((record) => (
          <PersonalRecordCard key={record.exerciseName} record={record} />
        ))}
      </div>

      {filteredRecords.length === 0 && filterText && (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          No exercises found matching "{filterText}"
        </div>
      )}
    </div>
  );
};

const PersonalRecordCard = ({ record }) => {
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-[var(--text-primary)] mb-3 truncate">
        {record.exerciseName}
      </h3>

      <div className="space-y-2">
        {}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Max Weight:</span>
          <div className="text-right">
            <span className="font-bold text-[var(--accent-primary)]">
              {record.maxWeight} lbs
            </span>
            <div className="text-xs text-[var(--text-secondary)]">
              {formatDate(record.maxWeightDate)}
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Max Reps:</span>
          <div className="text-right">
            <span className="font-bold text-[var(--accent-secondary)]">
              {record.maxReps} reps
            </span>
            <div className="text-xs text-[var(--text-secondary)]">
              {formatDate(record.maxRepsDate)}
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Max Volume:</span>
          <div className="text-right">
            <span className="font-bold text-purple-500">
              {record.maxVolume} lbs
            </span>
            <div className="text-xs text-[var(--text-secondary)]">
              {formatDate(record.maxVolumeDate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
