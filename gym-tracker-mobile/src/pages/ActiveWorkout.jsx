import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useActiveWorkout } from "../hooks/useActiveWorkout.js";
import useSwipeGesture from "../hooks/useSwipeGesture.js";
import {
  getWorkoutPlan,
  updateWorkoutPlan,
} from "../services/workoutService.js";
import {
  getLastWorkoutSession,
  getUpdatedExercisesFromSession,
} from "../services/progressService.js";
import { useAuthContext } from "../hooks/useAuthContext.js";
import Button from "../components/common/Button.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import Modal from "../components/common/Modal.jsx";
import SetTracker from "../components/workout/SetTracker.jsx";
import Timer from "../components/workout/Timer.jsx";
import WorkoutSummary from "../components/workout/WorkoutSummary.jsx";

const ActiveWorkout = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();

  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [showTimer, setShowTimer] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [lastSession, setLastSession] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const {
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
  } = useActiveWorkout(planId, workoutPlan);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user?.uid || !planId) {
        return;
      }

      try {
        setLoadingPlan(true);
        const plan = await getWorkoutPlan(planId, user.uid);

        if (!plan) {
          throw new Error("Workout plan not found");
        }

        setWorkoutPlan(plan);

        const lastWorkout = await getLastWorkoutSession(user.uid, planId);
        setLastSession(lastWorkout);
      } catch (err) {
        console.error("Error loading workout plan:", err);
        navigate("/plans");
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchPlan();
  }, [planId, user?.uid, navigate]);

  useEffect(() => {
    if (workoutPlan && !session && !loading) {

      const sessionId = location.state?.sessionId;

      if (sessionId) {
        loadSession(sessionId).catch((err) => {
          console.error("Error loading session:", err);
          startWorkout();
        });
      } else {
        startWorkout();
      }
    }
  }, [
    workoutPlan,
    session,
    loading,
    location.state,
    startWorkout,
    loadSession,
  ]);

  const handleSetComplete = (setData) => {
    completeSet(setData);

    if (currentExercise?.restTime > 0) {
      setShowTimer(true);
    }
  };

  const handleExerciseComplete = (exerciseData) => {
    completeExercise(exerciseData);

    const hasNext = nextExercise();
    if (!hasNext) {
      setShowCompleteModal(true);
    } else {
      setShowTimer(false);
    }
  };

  const handleSkipExercise = (exerciseData) => {
    skipExercise(exerciseData);

    const hasNext = nextExercise();
    if (!hasNext) {
      setShowCompleteModal(true);
    } else {
      setShowTimer(false);
    }
  };

  const handleNext = () => {
    const hasNext = nextExercise();
    if (!hasNext) {
      setShowCompleteModal(true);
    }
    setShowTimer(false);
  };

  const handlePrevious = () => {
    previousExercise();
    setShowTimer(false);
  };

  const handleSwipeLeft = () => {
    if (!showTimer && !isLastExercise) {
      setSwipeDirection("left");
      setTimeout(() => setSwipeDirection(null), 300);
      handleNext();
    }
  };

  const handleSwipeRight = () => {
    if (!showTimer && !isFirstExercise) {
      setSwipeDirection("right");
      setTimeout(() => setSwipeDirection(null), 300);
      handlePrevious();
    }
  };

  const { ref: swipeRef, isSwiping } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 75,
    maxSwipeTime: 400,
  });

  const handleTimerComplete = () => {
    setShowTimer(false);
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = async () => {
    try {
      if (session?.status === "active") {
        await pauseWorkout();
      }
      navigate("/plans");
    } catch (err) {
      console.error("Error pausing workout:", err);
      navigate("/plans");
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      const completed = await completeWorkout();
      setCompletedSession(completed);

      if (workoutPlan && completed) {
        const updatedExercises = getUpdatedExercisesFromSession(
          workoutPlan,
          completed
        );
        await updateWorkoutPlan(planId, user.uid, {
          exercises: updatedExercises,
        });
      }

      setShowCompleteModal(false);
      setShowSummary(true);
    } catch (err) {
      console.error("Error completing workout:", err);
    }
  };

  const handleSummaryClose = () => {
    navigate("/plans", {
      state: { completedSession },
    });
  };

  if (loadingPlan || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-[var(--error)] mb-4">Error</h2>
          <p className="text-[var(--text-primary)] mb-6">{error}</p>
          <div className="flex gap-3">
            <Button variant="primary" onClick={clearError} fullWidth>
              Retry
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/plans")}
              fullWidth
            >
              Back to Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary && completedSession) {
    return (
      <WorkoutSummary session={completedSession} onClose={handleSummaryClose} />
    );
  }

  if (!workoutPlan || !session || !currentExercise) {
    return null;
  }

  const progress =
    ((currentExerciseIndex + 1) / workoutPlan.exercises.length) * 100;
  const isFirstExercise = currentExerciseIndex === 0;
  const isLastExercise =
    currentExerciseIndex === workoutPlan.exercises.length - 1;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {}
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-secondary)] sticky top-0 z-10 safe-area-top">
        <div className="container mx-auto px-4 py-4 container-safe">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {workoutPlan.name}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Exercise {currentExerciseIndex + 1} of{" "}
                {workoutPlan.exercises.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="text-xs text-[var(--text-secondary)]">
                  Saving...
                </span>
              )}
              <Button variant="secondary" onClick={handleExit} className="px-4">
                Exit
              </Button>
            </div>
          </div>

          {}
          <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-primary)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {}
      <div
        ref={swipeRef}
        className={`container mx-auto px-4 py-6 max-w-2xl container-safe safe-area-bottom relative ${
          isSwiping ? "no-select" : ""
        }`}
      >
        {}
        {!showTimer && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
            {!isFirstExercise && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
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
                Swipe
              </span>
            )}
            <span className="text-xs">|</span>
            {!isLastExercise && (
              <span className="flex items-center gap-1">
                Swipe
                <svg
                  className="w-4 h-4"
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
              </span>
            )}
          </div>
        )}

        {}
        {swipeDirection && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div
              className={`text-6xl opacity-50 transition-all duration-300 ${
                swipeDirection === "left"
                  ? "animate-[slideOutLeft_0.3s_ease-out]"
                  : "animate-[slideOutRight_0.3s_ease-out]"
              }`}
            >
              {swipeDirection === "left" ? "→" : "←"}
            </div>
          </div>
        )}

        {}
        {showTimer && currentExercise.restTime > 0 && (
          <div className="mb-6">
            <Timer
              duration={currentExercise.restTime}
              onComplete={handleTimerComplete}
              autoStart={true}
            />
          </div>
        )}

        {}
        <div className={`mb-6 ${showTimer ? "hidden" : ""}`}>
          <SetTracker
            key={currentExercise.id}
            exercise={currentExercise}
            lastSession={lastSession}
            onSetComplete={handleSetComplete}
            onExerciseComplete={handleExerciseComplete}
            onSkip={handleSkipExercise}
          />
        </div>

        {}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={isFirstExercise}
            fullWidth
            className="touch-target touch-manipulation touch-active"
          >
            ← Previous
          </Button>
          <Button
            variant="secondary"
            onClick={handleNext}
            disabled={isLastExercise}
            fullWidth
            className="touch-target touch-manipulation touch-active"
          >
            Next →
          </Button>
        </div>

        {}
        <div className="mt-8 bg-[var(--bg-tertiary)] rounded-lg p-4 border-2 border-[var(--border-secondary)] shadow-[var(--shadow-md)]">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
            Workout Overview
          </h3>
          <div className="space-y-2">
            {workoutPlan.exercises.map((exercise, index) => {
              const isCompleted = session.completedExercises.some(
                (ex) => ex.exerciseId === exercise.id && !ex.skipped
              );
              const isSkipped = session.completedExercises.some(
                (ex) => ex.exerciseId === exercise.id && ex.skipped
              );
              const isCurrent = index === currentExerciseIndex;

              return (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    isCurrent
                      ? "bg-[var(--accent-primary-bg)] border-[var(--accent-primary)] shadow-[var(--shadow-sm)]"
                      : "bg-[var(--bg-elevated)] border-[var(--border-secondary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-[var(--shadow-xs)] ${
                        isCompleted
                          ? "bg-[var(--success-bg)] border-[var(--success)]"
                          : isSkipped
                          ? "bg-[var(--bg-tertiary)] border-[var(--text-tertiary)]"
                          : isCurrent
                          ? "bg-[var(--accent-primary-bg)] border-[var(--accent-primary)]"
                          : "bg-[var(--bg-tertiary)] border-[var(--border-secondary)]"
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${
                          isCompleted
                            ? "text-[var(--success)]"
                            : isSkipped
                            ? "text-[var(--text-tertiary)]"
                            : isCurrent
                            ? "text-[var(--accent-primary)]"
                            : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {isCompleted ? "✓" : isSkipped ? "−" : index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {exercise.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">
                        {exercise.sets} × {exercise.reps}
                        {exercise.weight ? ` @ ${exercise.weight}kg` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Workout?"
      >
        <p className="text-[var(--text-primary)] mb-6">
          Your progress will be saved and you can resume this workout later.
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowExitModal(false)}
            fullWidth
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmExit} fullWidth>
            Exit Workout
          </Button>
        </div>
      </Modal>

      {}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Workout?"
      >
        <div className="mb-6">
          <p className="text-[var(--text-primary)] mb-4">
            Great job! You've completed all exercises.
          </p>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-4">
            {}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Exercises
                </p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {
                    session.completedExercises.filter((ex) => !ex.skipped)
                      .length
                  }
                  <span className="text-sm text-[var(--text-secondary)] ml-1">
                    / {workoutPlan.exercises.length}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Duration</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {Math.round((new Date() - session.startTime) / 1000 / 60)}{" "}
                  <span className="text-sm">min</span>
                </p>
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-secondary)]">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Total Sets
                </p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {session.completedExercises.reduce(
                    (total, ex) =>
                      !ex.skipped ? total + ex.completedSets.length : total,
                    0
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Total Reps
                </p>
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {session.completedExercises.reduce(
                    (total, ex) =>
                      !ex.skipped
                        ? total +
                          ex.completedSets.reduce(
                            (setTotal, set) => setTotal + set.reps,
                            0
                          )
                        : total,
                    0
                  )}
                </p>
              </div>
            </div>

            {}
            {(() => {
              const totalVolume = session.completedExercises.reduce(
                (total, ex) => {
                  if (!ex.skipped) {
                    return (
                      total +
                      ex.completedSets.reduce(
                        (setTotal, set) =>
                          setTotal + (set.weight || 0) * set.reps,
                        0
                      )
                    );
                  }
                  return total;
                },
                0
              );

              if (totalVolume > 0) {
                return (
                  <div className="pt-4 border-t border-[var(--border-secondary)]">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Total Volume
                    </p>
                    <p className="text-lg font-semibold text-[var(--accent-primary)]">
                      {totalVolume.toLocaleString()} kg
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {}
            <div className="pt-4 border-t border-[var(--border-secondary)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  Completion Rate
                </p>
                <p className="text-lg font-semibold text-[var(--accent-secondary)]">
                  {Math.round(
                    (session.completedExercises.filter((ex) => !ex.skipped)
                      .length /
                      workoutPlan.exercises.length) *
                      100
                  )}
                  %
                </p>
              </div>
              <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-secondary)] transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (session.completedExercises.filter((ex) => !ex.skipped)
                        .length /
                        workoutPlan.exercises.length) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowCompleteModal(false)}
            fullWidth
          >
            Continue
          </Button>
          <Button variant="primary" onClick={handleCompleteWorkout} fullWidth>
            Finish Workout
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ActiveWorkout;
