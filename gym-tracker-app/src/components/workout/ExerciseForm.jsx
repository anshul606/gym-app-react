import { useState } from "react";
import { Button, Input } from "../common";

const ExerciseForm = ({ exercise, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: exercise?.name || "",
    sets: exercise?.sets || "",
    reps: exercise?.reps || "",
    weight: exercise?.weight || "",
    restTime: exercise?.restTime || 60,
    notes: exercise?.notes || "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Exercise name is required";
    }

    if (!formData.sets || formData.sets < 1) {
      newErrors.sets = "Sets must be at least 1";
    }

    if (!formData.reps || formData.reps < 1) {
      newErrors.reps = "Reps must be at least 1";
    }

    if (formData.weight && formData.weight < 0) {
      newErrors.weight = "Weight cannot be negative";
    }

    if (!formData.restTime || formData.restTime < 0) {
      newErrors.restTime = "Rest time cannot be negative";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const exerciseData = {
      ...formData,
      sets: parseInt(formData.sets, 10),
      reps: parseInt(formData.reps, 10),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      restTime: parseInt(formData.restTime, 10),
      muscleGroups: exercise?.muscleGroups || [],
      id: exercise?.id || `exercise-${Date.now()}`,
    };

    onSave(exerciseData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          label="Exercise Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          placeholder="e.g., Bench Press"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Sets"
            type="number"
            value={formData.sets}
            onChange={(e) => handleChange("sets", e.target.value)}
            error={errors.sets}
            min="1"
            placeholder="3"
            required
          />
        </div>

        <div>
          <Input
            label="Reps"
            type="number"
            value={formData.reps}
            onChange={(e) => handleChange("reps", e.target.value)}
            error={errors.reps}
            min="1"
            placeholder="10"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Weight (optional)"
            type="number"
            value={formData.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
            error={errors.weight}
            min="0"
            step="0.5"
            placeholder="0"
          />
        </div>

        <div>
          <Input
            label="Rest Time (seconds)"
            type="number"
            value={formData.restTime}
            onChange={(e) => handleChange("restTime", e.target.value)}
            error={errors.restTime}
            min="0"
            placeholder="60"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Add any notes about this exercise..."
          rows="3"
          className="w-full px-3 py-2 border border-[var(--border-secondary)] rounded-lg
                   bg-[var(--bg-primary)] text-[var(--text-primary)]
                   focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent
                   placeholder-[var(--text-tertiary)]"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" className="flex-1">
          {exercise ? "Update Exercise" : "Add Exercise"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ExerciseForm;
