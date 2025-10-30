import { useState, useEffect } from "react";
import { Button, Input, Modal, VirtualList } from "../common";
import ExerciseForm from "./ExerciseForm";

const VIRTUAL_SCROLL_THRESHOLD = 10;

const WorkoutPlanForm = ({ plan, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    exercises: plan?.exercises || [],
  });

  const [errors, setErrors] = useState({});
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        description: plan.description || "",
        exercises: plan.exercises || [],
      });
    }
  }, [plan]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Workout plan name is required";
    }

    if (formData.exercises.length === 0) {
      newErrors.exercises = "Add at least one exercise to the plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddExercise = () => {
    setEditingExercise(null);
    setEditingIndex(null);
    setShowExerciseModal(true);
  };

  const handleEditExercise = (exercise, index) => {
    setEditingExercise(exercise);
    setEditingIndex(index);
    setShowExerciseModal(true);
  };

  const handleSaveExercise = (exerciseData) => {
    if (editingIndex !== null) {

      const updatedExercises = [...formData.exercises];
      updatedExercises[editingIndex] = exerciseData;
      setFormData((prev) => ({ ...prev, exercises: updatedExercises }));
    } else {

      setFormData((prev) => ({
        ...prev,
        exercises: [...prev.exercises, exerciseData],
      }));
    }

    if (errors.exercises) {
      setErrors((prev) => ({ ...prev, exercises: "" }));
    }

    setShowExerciseModal(false);
    setEditingExercise(null);
    setEditingIndex(null);
  };

  const handleDeleteExercise = (index) => {
    const updatedExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, exercises: updatedExercises }));
  };

  const handleMoveExercise = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.exercises.length) return;

    const updatedExercises = [...formData.exercises];
    [updatedExercises[index], updatedExercises[newIndex]] = [
      updatedExercises[newIndex],
      updatedExercises[index],
    ];
    setFormData((prev) => ({ ...prev, exercises: updatedExercises }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const planData = {
      ...formData,
      id: plan?.id,
      userId: plan?.userId,
      createdAt: plan?.createdAt || new Date(),
      updatedAt: new Date(),
      isActive: plan?.isActive ?? true,
    };

    onSave(planData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Workout Plan Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            placeholder="e.g., Upper Body Strength"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            Description (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe your workout plan..."
            rows="3"
            className="w-full px-3 py-2 border border-[var(--border-secondary)] rounded-lg
                     bg-[var(--bg-primary)] text-[var(--text-primary)]
                     focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent
                     placeholder-[var(--text-tertiary)]"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Exercises
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddExercise}
              className="text-sm"
            >
              + Add Exercise
            </Button>
          </div>

          {errors.exercises && (
            <p className="text-red-500 text-sm mb-2">{errors.exercises}</p>
          )}

          {formData.exercises.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-[var(--border-secondary)] rounded-lg">
              <p className="text-[var(--text-secondary)] mb-3">
                No exercises added yet
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddExercise}
              >
                Add Your First Exercise
              </Button>
            </div>
          ) : formData.exercises.length > VIRTUAL_SCROLL_THRESHOLD ? (

            <VirtualList
              items={formData.exercises}
              itemHeight={88}
              containerHeight={400}
              className="border border-[var(--border-secondary)] rounded-lg"
              renderItem={(exercise, index) => (
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-secondary)] last:border-b-0">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveExercise(index, "up")}
                      disabled={index === 0}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveExercise(index, "down")}
                      disabled={index === formData.exercises.length - 1}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {exercise.name}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight && ` @ ${exercise.weight} lbs`}
                      {" • "}
                      {exercise.restTime}s rest
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditExercise(exercise, index)}
                      className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(index)}
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          ) : (

            <div className="space-y-2">
              {formData.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-secondary)]"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveExercise(index, "up")}
                      disabled={index === 0}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveExercise(index, "down")}
                      disabled={index === formData.exercises.length - 1}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {exercise.name}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight && ` @ ${exercise.weight} lbs`}
                      {" • "}
                      {exercise.restTime}s rest
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditExercise(exercise, index)}
                      className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(index)}
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-[var(--border-secondary)]">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>

      <Modal
        isOpen={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setEditingExercise(null);
          setEditingIndex(null);
        }}
        title={editingExercise ? "Edit Exercise" : "Add Exercise"}
      >
        <ExerciseForm
          exercise={editingExercise}
          onSave={handleSaveExercise}
          onCancel={() => {
            setShowExerciseModal(false);
            setEditingExercise(null);
            setEditingIndex(null);
          }}
        />
      </Modal>
    </>
  );
};

export default WorkoutPlanForm;
