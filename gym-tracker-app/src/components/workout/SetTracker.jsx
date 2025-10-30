import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "../common/Button";
import Input from "../common/Input";
import {
  getLastExercisePerformance,
  getSuggestedValues,
} from "../../services/progressService.js";

const SetTracker = ({
  exercise,
  lastSession,
  onSetComplete,
  onExerciseComplete,
  onSkip,
}) => {

  const lastPerformance = lastSession
    ? getLastExercisePerformance(lastSession, exercise.id)
    : null;
  const suggestedValues = getSuggestedValues(lastPerformance, exercise);

  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState([]);
  const [currentReps, setCurrentReps] = useState(suggestedValues.reps);
  const [currentWeight, setCurrentWeight] = useState(suggestedValues.weight);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const totalSets = exercise.sets;
  const isCompleted = currentSetIndex >= totalSets;

  const handleCompleteSet = () => {
    const completedSet = {
      setNumber: currentSetIndex + 1,
      reps: currentReps,
      weight: currentWeight,
      completedAt: new Date(),
    };

    const updatedCompletedSets = [...completedSets, completedSet];
    setCompletedSets(updatedCompletedSets);

    if (onSetComplete) {
      onSetComplete(completedSet);
    }

    const nextSetIndex = currentSetIndex + 1;
    setCurrentSetIndex(nextSetIndex);

    setIsAdjusting(false);

    if (nextSetIndex >= totalSets) {
      if (onExerciseComplete) {
        onExerciseComplete({
          exerciseId: exercise.id,
          name: exercise.name,
          completedSets: updatedCompletedSets,
          skipped: false,
        });
      }
    } else {

      setCurrentReps(exercise.reps);
      setCurrentWeight(exercise.weight || 0);
    }
  };

  const handleSkipExercise = () => {
    if (onSkip) {
      onSkip({
        exerciseId: exercise.id,
        name: exercise.name,
        completedSets,
        skipped: true,
      });
    }
  };

  const handleAdjustValues = () => {
    setIsAdjusting(!isAdjusting);
  };

  const progressPercentage = (completedSets.length / totalSets) * 100;

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)] rounded-lg shadow-md">
        <div className="w-20 h-20 mb-4 rounded-full bg-[var(--accent-secondary)] bg-opacity-20 flex items-center justify-center">
          <span className="text-4xl text-[var(--accent-secondary)]">✓</span>
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Exercise Complete!
        </h3>
        <p className="text-[var(--text-secondary)] mb-6">
          {exercise.name} - {completedSets.length} sets completed
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 bg-[var(--bg-elevated)] rounded-lg shadow-[var(--shadow-lg)] border border-[var(--border-primary)]">
      {}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {exercise.name}
        </h3>
        <p className="text-[var(--text-secondary)]">
          {exercise.muscleGroups?.join(", ") || ""}
        </p>
      </div>

      {}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Set {currentSetIndex + 1} of {totalSets}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            {completedSets.length} completed
          </span>
        </div>
        <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden shadow-[var(--shadow-inner)]">
          <div
            className="h-full bg-[var(--accent-primary)] transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {}
      {lastPerformance && (
        <div className="mb-4 p-4 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--border-secondary)] shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              📊 Last Workout
            </span>
          </div>
          <div className="flex gap-4 text-sm text-[var(--text-primary)]">
            <span>
              <strong className="text-base">{lastPerformance.reps}</strong> reps
            </span>
            {lastPerformance.weight > 0 && (
              <span>
                @{" "}
                <strong className="text-base">{lastPerformance.weight}</strong>{" "}
                kg
              </span>
            )}
          </div>
        </div>
      )}

      {}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--border-secondary)] shadow-[var(--shadow-sm)]">
          <span className="text-xs font-medium text-[var(--text-secondary)] block mb-2 uppercase tracking-wide">
            {lastPerformance ? "Starting Reps" : "Target Reps"}
          </span>
          <span className="text-4xl font-bold text-[var(--text-primary)]">
            {currentReps}
          </span>
        </div>
        <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--border-secondary)] shadow-[var(--shadow-sm)]">
          <span className="text-xs font-medium text-[var(--text-secondary)] block mb-2 uppercase tracking-wide">
            {lastPerformance ? "Starting Weight" : "Target Weight"}
          </span>
          <span className="text-4xl font-bold text-[var(--text-primary)]">
            {currentWeight}
            <span className="text-lg ml-1">kg</span>
          </span>
        </div>
      </div>

      {}
      {isAdjusting && (
        <div className="mb-6 p-4 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--accent-primary)] shadow-[var(--shadow-md)]">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wide">
            Adjust Current Set
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                Actual Reps
              </label>
              <input
                type="number"
                value={currentReps}
                onChange={(e) => setCurrentReps(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 text-2xl font-bold text-[var(--text-primary)] bg-[var(--bg-elevated)] border-2 border-[var(--border-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all shadow-[var(--shadow-sm)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                Actual Weight (kg)
              </label>
              <input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                min="0"
                step="0.5"
                className="w-full px-4 py-3 text-2xl font-bold text-[var(--text-primary)] bg-[var(--bg-elevated)] border-2 border-[var(--border-secondary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all shadow-[var(--shadow-sm)]"
              />
            </div>
          </div>
        </div>
      )}

      {}
      {completedSets.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
            Completed Sets
          </h4>
          <div className="space-y-2">
            {completedSets.map((set, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg border-2 border-[var(--border-secondary)] shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--success)] bg-opacity-20 flex items-center justify-center border-2 border-[var(--success)] border-opacity-30">
                    <span className="text-sm font-bold text-[var(--success)]">
                      {set.setNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {set.reps} reps
                    </span>
                    {set.weight > 0 && (
                      <span className="text-sm text-[var(--text-secondary)] ml-2">
                        @ {set.weight} kg
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-lg text-[var(--success)]">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          onClick={handleCompleteSet}
          fullWidth
          className="text-lg py-4 min-h-[56px] touch-manipulation touch-active"
        >
          <span className="inline-block mr-2">✓</span>
          Complete Set {currentSetIndex + 1}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={handleAdjustValues}
            fullWidth
            className="touch-manipulation touch-active"
          >
            {isAdjusting ? "Done" : "Adjust"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleSkipExercise}
            fullWidth
            className="touch-manipulation touch-active"
          >
            Skip Exercise
          </Button>
        </div>
      </div>

      {}
      {exercise.restTime > 0 && (
        <div className="mt-4 p-3 bg-[var(--info-bg)] rounded-lg border-2 border-[var(--info)] border-opacity-30">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            💡 Rest time: {Math.floor(exercise.restTime / 60)}:
            {(exercise.restTime % 60).toString().padStart(2, "0")} between sets
          </span>
        </div>
      )}
    </div>
  );
};

SetTracker.propTypes = {
  exercise: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    sets: PropTypes.number.isRequired,
    reps: PropTypes.number.isRequired,
    weight: PropTypes.number,
    restTime: PropTypes.number,
    muscleGroups: PropTypes.arrayOf(PropTypes.string),
    notes: PropTypes.string,
  }).isRequired,
  lastSession: PropTypes.object,
  onSetComplete: PropTypes.func,
  onExerciseComplete: PropTypes.func,
  onSkip: PropTypes.func,
};

export default SetTracker;
