import PropTypes from "prop-types";

const LoadingSpinner = ({
  size = "medium",
  color = "primary",
  fullScreen = false,
  text = "",
}) => {
  const sizeStyles = {
    sm: "w-4 h-4 border-2",
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4",
  };

  const colorStyles = {
    primary: "border-[var(--accent-primary)] border-t-transparent",
    secondary: "border-[var(--accent-secondary)] border-t-transparent",
    white: "border-white border-t-transparent",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizeStyles[size]}
          ${colorStyles[color]}
          rounded-full animate-spin
        `}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-[var(--text-secondary)]">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)] bg-opacity-80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "small", "medium", "large"]),
  color: PropTypes.oneOf(["primary", "secondary", "white"]),
  fullScreen: PropTypes.bool,
  text: PropTypes.string,
};

export default LoadingSpinner;
