import PropTypes from "prop-types";
import Button from "../common/Button.jsx";

const WorkoutSummary = ({ session, onClose }) => {
  if (!session) {
    return null;
  }

  const metrics = session.metrics || {};
  const duration = session.totalDuration || 0;
  const completedExercises = session.completedExercises.filter(
    (ex) => !ex.skipped
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[var(--accent-secondary)] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Workout Complete!
          </h1>
          <p className="text-[var(--text-secondary)]">
            Great job on completing {session.planName}
          </p>
        </div>

        {}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 mb-6 shadow-lg">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Duration
              </p>
              <p className="text-4xl font-bold text-[var(--accent-primary)]">
                {duration}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">minutes</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                Exercises
              </p>
              <p className="text-4xl font-bold text-[var(--accent-primary)]">
                {metrics.completedExercisesCount || completedExercises.length}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">completed</p>
            </div>
          </div>
        </div>

        {}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Workout Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg-primary)] rounded-lg p-4">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Total Sets
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {metrics.totalSetsCompleted ||
                  completedExercises.reduce(
                    (total, ex) => total + ex.completedSets.length,
                    0
                  )}
              </p>
            </div>
            <div className="bg-[var(--bg-primary)] rounded-lg p-4">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                Total Reps
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {metrics.totalRepsCompleted ||
                  completedExercises.reduce(
                    (total, ex) =>
                      total +
                      ex.completedSets.reduce(
                        (setTotal, set) => setTotal + set.reps,
                        0
                      ),
                    0
                  )}
              </p>
            </div>
            {metrics.totalVolume > 0 && (
              <div className="bg-[var(--bg-primary)] rounded-lg p-4 col-span-2">
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  Total Volume
                </p>
                <p className="text-2xl font-bold text-[var(--accent-primary)]">
                  {metrics.totalVolume.toLocaleString()} kg
                </p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Completion Rate
            </h2>
            <p className="text-2xl font-bold text-[var(--accent-secondary)]">
              {metrics.completionRate || 0}%
            </p>
          </div>
          <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-secondary)] transition-all duration-500"
              style={{ width: `${metrics.completionRate || 0}%` }}
            />
          </div>
          {metrics.skippedExercisesCount > 0 && (
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {metrics.skippedExercisesCount} exercise
              {metrics.skippedExercisesCount > 1 ? "s" : ""} skipped
            </p>
          )}
        </div>

        {}
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Exercise Breakdown
          </h2>
          <div className="space-y-3">
            {session.completedExercises.map((exercise, index) => (
              <div
                key={index}
                className={`bg-[var(--bg-primary)] rounded-lg p-4 ${
                  exercise.skipped ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-[var(--text-primary)]">
                    {exercise.name}
                  </h3>
                  {exercise.skipped ? (
                    <span className="text-xs bg-[var(--text-secondary)] bg-opacity-20 text-[var(--text-secondary)] px-2 py-1 rounded">
                      Skipped
                    </span>
                  ) : (
                    <span className="text-xs bg-[var(--accent-secondary)] bg-opacity-20 text-[var(--accent-secondary)] px-2 py-1 rounded">
                      Completed
                    </span>
                  )}
                </div>
                {!exercise.skipped && exercise.completedSets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {exercise.completedSets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="text-xs bg-[var(--bg-secondary)] px-3 py-1 rounded-full text-[var(--text-secondary)]"
                      >
                        {set.reps} reps
                        {set.weight ? ` @ ${set.weight}kg` : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="space-y-3">
          <Button variant="primary" onClick={onClose} fullWidth>
            Back to Workout Plans
          </Button>
        </div>
      </div>
    </div>
  );
};

WorkoutSummary.propTypes = {
  session: PropTypes.shape({
    planName: PropTypes.string.isRequired,
    totalDuration: PropTypes.number,
    completedExercises: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        skipped: PropTypes.bool.isRequired,
        completedSets: PropTypes.arrayOf(
          PropTypes.shape({
            reps: PropTypes.number.isRequired,
            weight: PropTypes.number,
          })
        ).isRequired,
      })
    ).isRequired,
    metrics: PropTypes.shape({
      totalVolume: PropTypes.number,
      completionRate: PropTypes.number,
      totalSetsCompleted: PropTypes.number,
      totalRepsCompleted: PropTypes.number,
      completedExercisesCount: PropTypes.number,
      skippedExercisesCount: PropTypes.number,
    }),
  }),
  onClose: PropTypes.func.isRequired,
};

export default WorkoutSummary;
