import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Button from "../common/Button";

const Timer = ({
  duration,
  onComplete,
  onPause,
  onResume,
  autoStart = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    audioRef.current = audioContext;

    return () => {
      if (audioContext.state !== "closed") {
        audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const handleComplete = () => {
    setIsRunning(false);
    setIsCompleted(true);
    playCompletionSound();
    if (onComplete) {
      onComplete();
    }
  };

  const playCompletionSound = () => {
    if (audioRef.current) {
      const oscillator = audioRef.current.createOscillator();
      const gainNode = audioRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioRef.current.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioRef.current.currentTime + 0.5
      );

      oscillator.start(audioRef.current.currentTime);
      oscillator.stop(audioRef.current.currentTime + 0.5);
    }
  };

  const handlePlayPause = () => {
    if (isRunning) {
      setIsRunning(false);
      if (onPause) {
        onPause();
      }
    } else {
      setIsRunning(true);
      setIsCompleted(false);
      if (onResume) {
        onResume();
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(duration);
    setIsCompleted(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progressPercentage = ((duration - timeRemaining) / duration) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg-secondary)] rounded-lg shadow-md">
      {}
      <div className="relative w-48 h-48 mb-6">
        {}
        <svg className="w-full h-full transform -rotate-90">
          {}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke="var(--bg-tertiary)"
            strokeWidth="8"
            fill="none"
          />
          {}
          <circle
            cx="96"
            cy="96"
            r="88"
            stroke={
              isCompleted ? "var(--accent-secondary)" : "var(--accent-primary)"
            }
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 88}`}
            strokeDashoffset={`${
              2 * Math.PI * 88 * (1 - progressPercentage / 100)
            }`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-5xl font-bold ${
              isCompleted
                ? "text-[var(--accent-secondary)]"
                : timeRemaining <= 10
                ? "text-[var(--error)] animate-pulse"
                : "text-[var(--text-primary)]"
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
          <span className="text-sm text-[var(--text-secondary)] mt-2">
            {isCompleted ? "Complete!" : isRunning ? "Running" : "Paused"}
          </span>
        </div>
      </div>

      {}
      <div className="flex gap-3 w-full max-w-xs">
        <Button
          variant={isRunning ? "secondary" : "primary"}
          onClick={handlePlayPause}
          fullWidth
          disabled={timeRemaining === 0 && !isCompleted}
        >
          {isRunning ? (
            <>
              <span className="inline-block mr-2">⏸</span>
              Pause
            </>
          ) : (
            <>
              <span className="inline-block mr-2">▶</span>
              {isCompleted ? "Restart" : "Start"}
            </>
          )}
        </Button>
        <Button variant="secondary" onClick={handleReset} className="px-6">
          <span className="inline-block">↻</span>
        </Button>
      </div>

      {}
      {isCompleted && (
        <div className="mt-4 px-4 py-2 bg-[var(--accent-secondary)] bg-opacity-20 rounded-lg animate-pulse">
          <span className="text-[var(--accent-secondary)] font-medium">
            ✓ Rest period complete!
          </span>
        </div>
      )}
    </div>
  );
};

Timer.propTypes = {
  duration: PropTypes.number.isRequired,
  onComplete: PropTypes.func,
  onPause: PropTypes.func,
  onResume: PropTypes.func,
  autoStart: PropTypes.bool,
};

export default Timer;
