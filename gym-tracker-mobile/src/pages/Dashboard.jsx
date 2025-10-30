import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useWorkoutPlans } from "../hooks/useWorkoutPlans.js";
import useSwipeGesture from "../hooks/useSwipeGesture.js";
import {
  getUserWorkoutSessions,
  deleteWorkoutSession,
} from "../services/workoutSessionService.js";
import Button from "../components/common/Button.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import StatCard from "../components/common/StatCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import OnboardingFlow from "../components/common/OnboardingFlow.jsx";
import WorkoutPlanCard from "../components/workout/WorkoutPlanCard.jsx";
import {
  calculateWorkoutStats,
  getMotivationalMessage,
} from "../utils/helpers.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, getUserDisplayName } = useAuth();
  const { workoutPlans, loading: plansLoading } = useWorkoutPlans({
    activeOnly: true,
    realtime: false,
  });

  const [recentSessions, setRecentSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const pages = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/workout-plans", name: "Workout Plans" },
    { path: "/progress", name: "Progress" },
    { path: "/profile", name: "Profile" },
  ];
  const currentPageIndex = 0;

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
    const fetchSessions = async () => {
      if (!user?.uid) {
        setRecentSessions([]);
        setStats(null);
        setSessionsLoading(false);
        return;
      }

      try {
        setSessionsLoading(true);

        const sessions = await getUserWorkoutSessions(user.uid, {
          status: "completed",
        });

        setRecentSessions(sessions.slice(0, 5));

        const calculatedStats = calculateWorkoutStats(sessions);
        setStats(calculatedStats);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setRecentSessions([]);
        setStats(null);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, [user?.uid]);

  useEffect(() => {

    const onboardingCompleted = localStorage.getItem(
      `onboarding_completed_${user?.uid}`
    );
    setHasSeenOnboarding(!!onboardingCompleted);

    if (
      !plansLoading &&
      !sessionsLoading &&
      workoutPlans.length === 0 &&
      recentSessions.length === 0 &&
      !onboardingCompleted
    ) {

      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    user?.uid,
    workoutPlans.length,
    recentSessions.length,
    plansLoading,
    sessionsLoading,
  ]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(`onboarding_completed_${user?.uid}`, "true");
    setHasSeenOnboarding(true);
    setShowOnboarding(false);

    handleCreatePlan();
  };

  const handleOnboardingClose = () => {
    localStorage.setItem(`onboarding_completed_${user?.uid}`, "true");
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const handleStartWorkout = (planId) => {
    navigate(`/active-workout?planId=${planId}`);
  };

  const handleEditPlan = (planId) => {
    navigate(`/workout-plans?edit=${planId}`);
  };

  const handleDeletePlan = (planId) => {
    console.log("Delete plan:", planId);
  };

  const handleCreatePlan = () => {
    navigate("/workout-plans?create=true");
  };

  const handleViewAllPlans = () => {
    navigate("/workout-plans");
  };

  const handleViewProgress = () => {
    navigate("/progress");
  };

  const handleRestartOnboarding = () => {
    setShowOnboarding(true);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const workoutDate = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - workoutDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return workoutDate.toLocaleDateString();
  };

  const isLoading = plansLoading || sessionsLoading;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] safe-area-bottom">
      {}
      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
        userName={getUserDisplayName() || "there"}
      />

      <div
        ref={swipeRef}
        className="container mx-auto px-4 py-6 md:py-8 pb-40 md:pb-8 max-w-7xl container-safe"
      >
        {}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Welcome back, {getUserDisplayName() || user?.email}!
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  Active Workout Plans
                </h2>
                {workoutPlans.length > 0 && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleViewAllPlans}
                  >
                    View All
                  </Button>
                )}
              </div>

              {workoutPlans.length === 0 ? (
                <div>
                  <EmptyState
                    icon={
                      <svg
                        className="w-full h-full"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    }
                    title="No Workout Plans Yet"
                    description="Create your first workout plan to get started on your fitness journey! Add exercises, set your goals, and start tracking your progress."
                    actionLabel="Create Your First Plan"
                    onAction={handleCreatePlan}
                    variant="default"
                  />
                  {hasSeenOnboarding && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleRestartOnboarding}
                        className="text-sm text-[var(--accent-primary)] hover:underline"
                      >
                        Need help? View the tutorial again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workoutPlans.slice(0, 6).map((plan) => (
                    <WorkoutPlanCard
                      key={plan.id}
                      plan={plan}
                      onStart={handleStartWorkout}
                      onEdit={handleEditPlan}
                      onDelete={handleDeletePlan}
                    />
                  ))}
                </div>
              )}
            </section>

            {}
            <section>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Recent Workout History
              </h2>

              {recentSessions.length === 0 ? (
                <EmptyState
                  icon={
                    <svg
                      className="w-full h-full"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  }
                  title="No Workouts Completed Yet"
                  description={
                    workoutPlans.length > 0
                      ? "Start a workout from your plans above to begin tracking your fitness journey!"
                      : "Create a workout plan first, then start tracking your workouts here!"
                  }
                  variant="success"
                />
              ) : (
                <div className="card divide-y divide-[var(--border-color)]">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/workout-history/${session.id}`)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">
                            {session.planName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--text-secondary)]">
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <span>{formatDate(session.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <span>
                                {formatDuration(session.totalDuration)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                              </svg>
                              <span>
                                {session.completedExercises?.length || 0}{" "}
                                exercises
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-[var(--accent-secondary)] bg-opacity-10 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-[var(--accent-secondary)]"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this workout session?"
                                )
                              ) {
                                try {
                                  await deleteWorkoutSession(
                                    session.id,
                                    user.uid
                                  );

                                  const sessions = await getUserWorkoutSessions(
                                    user.uid,
                                    {
                                      status: "completed",
                                    }
                                  );
                                  setRecentSessions(sessions.slice(0, 5));
                                  const calculatedStats =
                                    calculateWorkoutStats(sessions);
                                  setStats(calculatedStats);
                                } catch (error) {
                                  console.error(
                                    "Error deleting session:",
                                    error
                                  );
                                  alert("Failed to delete workout session");
                                }
                              }
                            }}
                            className="p-2 text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded-lg transition-colors"
                            aria-label="Delete workout"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
