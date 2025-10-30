import PropTypes from "prop-types";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = "",
  ...props
}) => {
  const inputStyles = `
    w-full px-3 py-2.5 rounded-lg border transition-all duration-200
    bg-[var(--bg-primary)] text-[var(--text-primary)]
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:opacity-50 disabled:cursor-not-allowed
    min-h-[44px] text-base touch-manipulation
    ${
      error
        ? "border-[var(--error)] focus:ring-[var(--error)] focus:border-[var(--error)]"
        : "border-[var(--border-secondary)] focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
    }
  `;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
          {required && <span className="text-[var(--error)] ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputStyles}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <span
          id={`${name}-error`}
          className="text-sm text-[var(--error)] mt-1"
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
