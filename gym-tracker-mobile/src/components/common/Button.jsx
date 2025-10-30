import PropTypes from "prop-types";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  onClick,
  disabled = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation active:scale-[0.98]";

  const sizeStyles = {
    small: "py-2 px-4 text-sm min-h-[44px] rounded-[var(--radius-lg)]",
    medium:
      "py-2.5 px-5 text-[0.9375rem] min-h-[44px] rounded-[var(--radius-lg)]",
    large: "py-3 px-6 text-base min-h-[48px] rounded-[var(--radius-xl)]",
  };

  const variantStyles = {
    primary:
      "bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:bg-[var(--accent-primary-hover)] focus:ring-[var(--border-focus)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
    secondary:
      "bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[1.5px] border-[var(--border-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-focus)] focus:ring-[var(--border-focus)]",
    danger:
      "bg-[var(--error)] text-white hover:bg-[var(--error-hover)] focus:ring-[var(--error)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
