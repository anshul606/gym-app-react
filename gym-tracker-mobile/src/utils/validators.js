import {
  MIN_PASSWORD_LENGTH,
  MAX_EXERCISE_NAME_LENGTH,
  MAX_WORKOUT_PLAN_NAME_LENGTH,
} from "./constants.js";

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }

  return { isValid: true, message: "" };
};

export const validateExerciseName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: "Exercise name is required" };
  }

  if (name.length > MAX_EXERCISE_NAME_LENGTH) {
    return {
      isValid: false,
      message: `Exercise name must be less than ${MAX_EXERCISE_NAME_LENGTH} characters`,
    };
  }

  return { isValid: true, message: "" };
};

export const validateWorkoutPlanName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: "Workout plan name is required" };
  }

  if (name.length > MAX_WORKOUT_PLAN_NAME_LENGTH) {
    return {
      isValid: false,
      message: `Workout plan name must be less than ${MAX_WORKOUT_PLAN_NAME_LENGTH} characters`,
    };
  }

  return { isValid: true, message: "" };
};

export const validatePositiveNumber = (value, fieldName = "Value") => {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, message: `${fieldName} is required` };
  }

  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return {
      isValid: false,
      message: `${fieldName} must be a positive number`,
    };
  }

  return { isValid: true, message: "" };
};
