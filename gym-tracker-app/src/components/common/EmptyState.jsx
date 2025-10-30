import PropTypes from "prop-types";
import Button from "./Button.jsx";

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  size = "medium",
}) => {
  const sizeClasses = {
    small: "p-4",
    medium: "p-8",
    large: "p-12",
  };

  const iconSizeClasses = {
    small: "w-12 h-12",
    medium: "w-16 h-16",
    large: "w-20 h-20",
  };

  const iconInnerSizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-10 h-10",
  };

  const variantColors = {
    default: "bg-[var(--accent-primary)] text-[var(--accent-primary)]",
    success: "bg-[var(--accent-secondary)] text-[var(--accent-secondary)]",
    warning: "bg-orange-500 text-orange-500",
    info: "bg-blue-500 text-blue-500",
  };

  return (
    <div className={`card ${sizeClasses[size]} text-center`}>
      <div className="max-w-md mx-auto">
        {}
        <div
          className={`${iconSizeClasses[size]} mx-auto mb-4 rounded-full ${
            variantColors[variant].split(" ")[0]
          } bg-opacity-10 flex items-center justify-center`}
        >
          <div
            className={`${iconInnerSizeClasses[size]} ${
              variantColors[variant].split(" ")[1]
            }`}
          >
            {icon}
          </div>
        </div>

        {}
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {title}
        </h3>

        {}
        <p className="text-[var(--text-secondary)] mb-6">{description}</p>

        {}
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  variant: PropTypes.oneOf(["default", "success", "warning", "info"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
};

export default EmptyState;
