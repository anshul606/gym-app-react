import PropTypes from "prop-types";

const StatCard = ({
  icon,
  value,
  label,
  trend,
  trendLabel,
  color = "primary",
}) => {

  const colorStyles = {
    primary: {
      backgroundColor: "var(--accent-primary-bg)",
      color: "var(--accent-primary)",
    },
    secondary: {
      backgroundColor: "var(--success-bg)",
      color: "var(--success)",
    },
    purple: {
      backgroundColor: "rgba(168, 85, 247, 0.1)",
      color: "#a855f7",
    },
    orange: {
      backgroundColor: "rgba(249, 115, 22, 0.1)",
      color: "#f97316",
    },
    blue: {
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      color: "#3b82f6",
    },
  };

  const trendColorClasses = {
    positive: "text-[var(--accent-secondary)]",
    negative: "text-red-500",
    neutral: "text-[var(--text-secondary)]",
  };

  return (
    <div className="card p-6 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {}
          <div
            className="inline-flex p-3 rounded-lg mb-4"
            style={colorStyles[color] || colorStyles.primary}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "inherit",
              }}
            >
              {icon}
            </div>
          </div>

          {}
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {value}
          </div>

          {}
          <div className="text-sm text-[var(--text-secondary)]">{label}</div>

          {}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                trendColorClasses[trend] || trendColorClasses.neutral
              }`}
            >
              {trend === "positive" && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              )}
              {trend === "negative" && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                </svg>
              )}
              <span>{trendLabel}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  trend: PropTypes.oneOf(["positive", "negative", "neutral"]),
  trendLabel: PropTypes.string,
  color: PropTypes.oneOf(["primary", "secondary", "purple", "orange", "blue"]),
};

export default StatCard;
