import { useState } from "react";
import PropTypes from "prop-types";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";

const OnboardingFlow = ({ isOpen, onClose, onComplete, userName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: `Welcome to Gym Tracker, ${userName}! 🎉`,
      description:
        "Let's get you started on your fitness journey. This quick guide will show you how to make the most of the app.",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
        </svg>
      ),
      tip: "You can always access help from the profile section.",
    },
    {
      title: "Create Your First Workout Plan",
      description:
        "Start by creating a workout plan. Add exercises with sets, reps, and rest times. You can create as many plans as you need for different workout days.",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
        </svg>
      ),
      tip: "Pro tip: Start with 3-4 exercises per plan to keep it manageable.",
    },
    {
      title: "Track Your Workouts",
      description:
        "When you're ready to work out, start a plan from the dashboard. Track each set, use the rest timer, and mark exercises as complete. Your progress is saved automatically.",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      tip: "Don't worry if you need to pause - your workout progress is saved!",
    },
    {
      title: "Monitor Your Progress",
      description:
        "View your workout history, track your streak, and see your improvements over time. The more you work out, the more insights you'll get!",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
      ),
      tip: "Consistency is key! Try to maintain a workout streak.",
    },
    {
      title: "You're All Set! 💪",
      description:
        "You're ready to start your fitness journey. Create your first workout plan and let's get moving!",
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5 13l4 4L19 7"></path>
        </svg>
      ),
      tip: "Remember: Every workout counts, no matter how small!",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onComplete();
  };

  const handleSkip = () => {
    setCurrentStep(0);
    onClose();
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} size="small">
      <div className="p-3 sm:p-4">
        {}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {currentStep + 1}/{steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Skip
            </button>
          </div>
          <div className="w-full h-1 sm:h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-primary)] transition-all duration-300 ease-out"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {}
        <div className="text-center mb-4 sm:mb-5">
          {}
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full bg-[var(--accent-primary)] bg-opacity-10 flex items-center justify-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--accent-primary)]">
              {currentStepData.icon}
            </div>
          </div>

          {}
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2 sm:mb-3 leading-tight">
            {currentStepData.title}
          </h2>

          {}
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3 sm:mb-4 leading-relaxed">
            {currentStepData.description}
          </p>

          {}
          <div className="inline-flex items-start gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[var(--accent-secondary)] bg-opacity-10 rounded-lg text-left max-w-full">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent-secondary)] flex-shrink-0 mt-0.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
            <span className="text-[10px] sm:text-xs text-[var(--text-primary)] leading-snug">
              {currentStepData.tip}
            </span>
          </div>
        </div>

        {}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={isFirstStep}
            size="small"
            className="flex-1 text-xs sm:text-sm py-2"
          >
            Back
          </Button>

          <div className="flex gap-1">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? "bg-[var(--accent-primary)] w-3 sm:w-4"
                    : "bg-[var(--bg-secondary)]"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            size="small"
            className="flex-1 text-xs sm:text-sm py-2"
          >
            {isLastStep ? "Start" : "Next"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

OnboardingFlow.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  userName: PropTypes.string,
};

OnboardingFlow.defaultProps = {
  userName: "there",
};

export default OnboardingFlow;
