import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../hooks/useTheme";

const ProgressChart = ({ data, metric, onTimeRangeChange }) => {
  const { theme } = useTheme();
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState("line");

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let daysToSubtract;

    switch (timeRange) {
      case "7d":
        daysToSubtract = 7;
        break;
      case "30d":
        daysToSubtract = 30;
        break;
      case "90d":
        daysToSubtract = 90;
        break;
      case "1y":
        daysToSubtract = 365;
        break;
      default:
        daysToSubtract = 30;
    }

    const cutoffDate = new Date(
      now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000
    );

    return data.filter((item) => {
      const itemDate =
        item.date instanceof Date ? item.date : new Date(item.date);
      return itemDate >= cutoffDate;
    });
  }, [data, timeRange]);

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    switch (metric) {
      case "frequency":
        return transformFrequencyData(filteredData, timeRange);
      case "volume":
        return transformVolumeData(filteredData);
      case "duration":
        return transformDurationData(filteredData);
      default:
        return filteredData;
    }
  }, [filteredData, metric, timeRange]);

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    if (onTimeRangeChange) {
      onTimeRangeChange(newRange);
    }
  };

  const colors = {
    primary: theme === "dark" ? "#60a5fa" : "#3b82f6",
    secondary: theme === "dark" ? "#34d399" : "#10b981",
    grid: theme === "dark" ? "#374151" : "#e5e7eb",
    text: theme === "dark" ? "#d1d5db" : "#6b7280",
  };

  const getMetricLabel = () => {
    switch (metric) {
      case "frequency":
        return "Workouts";
      case "volume":
        return "Volume (lbs)";
      case "duration":
        return "Duration (min)";
      default:
        return "Value";
    }
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {getMetricLabel()} Progress
          </h3>
          <TimeRangeSelector
            timeRange={timeRange}
            onChange={handleTimeRangeChange}
          />
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-[var(--text-secondary)]">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-center">
            No data available for the selected time range.
            <br />
            Complete more workouts to see your progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          {getMetricLabel()} Progress
        </h3>
        <div className="flex gap-2">
          <ChartTypeSelector chartType={chartType} onChange={setChartType} />
          <TimeRangeSelector
            timeRange={timeRange}
            onChange={handleTimeRangeChange}
          />
        </div>
      </div>

      {}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="date"
                stroke={colors.text}
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke={colors.text} style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  border: `1px solid ${colors.grid}`,
                  borderRadius: "0.5rem",
                  color: theme === "dark" ? "#f9fafb" : "#1f2937",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ fill: colors.primary, r: 4 }}
                activeDot={{ r: 6 }}
                name={getMetricLabel()}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="date"
                stroke={colors.text}
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke={colors.text} style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  border: `1px solid ${colors.grid}`,
                  borderRadius: "0.5rem",
                  color: theme === "dark" ? "#f9fafb" : "#1f2937",
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill={colors.primary}
                name={getMetricLabel()}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const TimeRangeSelector = ({ timeRange, onChange }) => {
  const ranges = [
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "90d", label: "90D" },
    { value: "1y", label: "1Y" },
  ];

  return (
    <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
      {ranges.map((range) => (
        <button
          key={range.value}
          type="button"
          onClick={() => onChange(range.value)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            timeRange === range.value
              ? "bg-[var(--bg-primary)] text-[var(--accent-primary)] shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

TimeRangeSelector.propTypes = {
  timeRange: PropTypes.oneOf(["7d", "30d", "90d", "1y"]).isRequired,
  onChange: PropTypes.func.isRequired,
};

const ChartTypeSelector = ({ chartType, onChange }) => {
  return (
    <div className="flex gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
      <button
        type="button"
        onClick={() => onChange("line")}
        className={`p-2 rounded-md transition-colors ${
          chartType === "line"
            ? "bg-[var(--bg-primary)] text-[var(--accent-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
        title="Line Chart"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("bar")}
        className={`p-2 rounded-md transition-colors ${
          chartType === "bar"
            ? "bg-[var(--bg-primary)] text-[var(--accent-primary)] shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
        title="Bar Chart"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>
    </div>
  );
};

ChartTypeSelector.propTypes = {
  chartType: PropTypes.oneOf(["line", "bar"]).isRequired,
  onChange: PropTypes.func.isRequired,
};

function transformFrequencyData(data, timeRange) {
  if (!data || data.length === 0) return [];

  const groupByWeek = timeRange === "90d" || timeRange === "1y";

  const grouped = {};

  data.forEach((item) => {
    const date = item.date instanceof Date ? item.date : new Date(item.date);
    let key;

    if (groupByWeek) {

      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff));
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = date.toISOString().split("T")[0];
    }

    if (!grouped[key]) {
      grouped[key] = { date: key, value: 0 };
    }
    grouped[key].value += 1;
  });

  return Object.values(grouped)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      ...item,
      date: formatDate(item.date, timeRange),
    }));
}

function transformVolumeData(data) {
  if (!data || data.length === 0) return [];

  return data
    .map((item) => ({
      date: formatDate(
        item.date instanceof Date ? item.date : new Date(item.date),
        "30d"
      ),
      value: Math.round(item.volume || 0),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function transformDurationData(data) {
  if (!data || data.length === 0) return [];

  return data
    .map((item) => ({
      date: formatDate(
        item.date instanceof Date ? item.date : new Date(item.date),
        "30d"
      ),
      value: Math.round(item.duration || 0),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function formatDate(date, timeRange) {
  const d = date instanceof Date ? date : new Date(date);

  if (timeRange === "7d") {

    return d.toLocaleDateString("en-US", { weekday: "short" });
  } else if (timeRange === "30d") {

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else if (timeRange === "90d") {

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else {

    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
}

ProgressChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
        .isRequired,
      volume: PropTypes.number,
      duration: PropTypes.number,
      planName: PropTypes.string,
    })
  ).isRequired,
  metric: PropTypes.oneOf(["frequency", "volume", "duration"]).isRequired,
  onTimeRangeChange: PropTypes.func,
};

ProgressChart.defaultProps = {
  onTimeRangeChange: null,
};

export default ProgressChart;
