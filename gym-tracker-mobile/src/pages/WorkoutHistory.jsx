import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getWorkoutSession,
  getUserWorkoutSessions,
} from "../services/workoutSessionService";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";

const WorkoutHistory = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [exerciseHistories, setExerciseHistories] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionAndHistory = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      if (!user?.uid) {

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const currentSession = await getWorkoutSession(sessionId, user.uid);

        if (!currentSession || currentSession.userId !== user.uid) {
          setError("Workout session not found");
          return;
        }

        setSession(currentSession);

        const allSessions = await getUserWorkoutSessions(user.uid, {
          planId: currentSession.planId,
          status: "completed",
        });

        const histories = {};
        currentSession.completedExercises?.forEach((exercise) => {
          const exerciseName = exercise.name;
          const exerciseSessions = allSessions
            .filter((s) =>
              s.completedExercises?.some((e) => e.name === exerciseName)
            )
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
            .slice(0, 3)
            .map((s) => ({
              date: s.startTime,
              exercise: s.completedExercises.find(
                (e) => e.name === exerciseName
              ),
            }));

          histories[exerciseName] = exerciseSessions;
        });

        setExerciseHistories(histories);
      } catch (err) {
        console.error("Error fetching workout history:", err);
        setError("Failed to load workout history");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionAndHistory();
  }, [sessionId, user?.uid]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] safe-area-bottom">
        <div className="container mx-auto px-4 py-8">
          <div className="card p-6 text-center">
            <p className="text-[var(--error)] mb-4">
              {error || "Session not found"}
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] safe-area-bottom">
      <div className="container mx-auto px-4 py-8 pb-32 md:pb-8">
        {}
        <div className="mb-6">
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            {session.planName}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {formatDate(session.startTime)}
          </p>
        </div>

        {}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Workout Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Duration</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {formatDuration(session.totalDuration)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Exercises</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {session.completedExercises?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Total Sets</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {session.completedExercises?.reduce(
                  (sum, ex) => sum + (ex.sets?.length || 0),
                  0
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Status</p>
              <p className="text-lg font-semibold text-[var(--success)]">
                Completed
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Exercises & History
          </h2>

          {session.completedExercises?.map((exercise, index) => (
            <div key={index} className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                {exercise.name}
              </h3>

              {}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  This Workout
                </h4>
                <div className="space-y-2">
                  {exercise.sets?.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="p-3 bg-[var(--bg-secondary)] rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          Set {setIndex + 1}
                        </span>
                        {set.completed && (
                          <span className="text-xs px-2 py-0.5 bg-[var(--success)] bg-opacity-10 text-[var(--success)] rounded">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {set.reps !== undefined && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-[var(--text-tertiary)]"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            <span className="text-[var(--text-secondary)]">
                              {set.reps} reps
                            </span>
                          </div>
                        )}
                        {set.weight !== undefined && set.weight > 0 && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-[var(--text-tertiary)]"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path>
                            </svg>
                            <span className="text-[var(--text-secondary)]">
                              {set.weight} lbs
                            </span>
                          </div>
                        )}
                        {set.time !== undefined && set.time > 0 && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-[var(--text-tertiary)]"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="text-[var(--text-secondary)]">
                              {set.time}s
                            </span>
                          </div>
                        )}
                        {set.distance !== undefined && set.distance > 0 && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-[var(--text-tertiary)]"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            <span className="text-[var(--text-secondary)]">
                              {set.distance} m
                            </span>
                          </div>
                        )}
                        {set.restTime !== undefined && set.restTime > 0 && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-[var(--text-tertiary)]"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span className="text-[var(--text-secondary)]">
                              Rest: {set.restTime}s
                            </span>
                          </div>
                        )}
                      </div>
                      {set.notes && (
                        <div className="mt-2 pt-2 border-t border-[var(--border-color)]">
                          <p className="text-xs text-[var(--text-tertiary)] italic">
                            Note: {set.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {}
              {exerciseHistories[exercise.name]?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                    Recent History (Last 3 Workouts)
                  </h4>
                  <div className="space-y-3">
                    {exerciseHistories[exercise.name].map(
                      (history, histIndex) => (
                        <div
                          key={histIndex}
                          className="p-3 bg-[var(--bg-tertiary)] rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {formatDate(history.date)}
                            </span>
                            <span className="text-xs font-medium text-[var(--text-secondary)]">
                              {history.exercise.sets?.length || 0} sets
                            </span>
                          </div>
                          <div className="space-y-2">
                            {history.exercise.sets?.map((set, setIdx) => (
                              <div
                                key={setIdx}
                                className="text-xs px-2 py-1.5 bg-[var(--bg-secondary)] rounded flex flex-wrap gap-2 items-center"
                              >
                                <span className="font-medium text-[var(--text-primary)]">
                                  #{setIdx + 1}
                                </span>
                                {set.reps !== undefined && (
                                  <span className="text-[var(--text-secondary)]">
                                    {set.reps}r
                                  </span>
                                )}
                                {set.weight !== undefined && set.weight > 0 && (
                                  <span className="text-[var(--text-secondary)]">
                                    × {set.weight}lbs
                                  </span>
                                )}
                                {set.time !== undefined && set.time > 0 && (
                                  <span className="text-[var(--text-secondary)]">
                                    {set.time}s
                                  </span>
                                )}
                                {set.distance !== undefined &&
                                  set.distance > 0 && (
                                    <span className="text-[var(--text-secondary)]">
                                      {set.distance}m
                                    </span>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutHistory;
