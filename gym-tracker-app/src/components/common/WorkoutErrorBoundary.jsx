import React from "react";
import { Button } from "./Button";

class WorkoutErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      sessionData: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {

    console.error("Workout Error Boundary caught an error:", error, errorInfo);

    try {
      const savedSession = localStorage.getItem("activeWorkoutSession");
      this.setState({
        error,
        errorInfo,
        sessionData: savedSession ? JSON.parse(savedSession) : null,
      });
    } catch (e) {
      console.error("Failed to retrieve session data:", e);
      this.setState({ error, errorInfo });
    }
  }

  handleRecoverSession = () => {
    const { sessionData } = this.state;
    const { onRecover } = this.props;

    if (sessionData && onRecover) {
      onRecover(sessionData);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      sessionData: null,
    });
  };

  handleReset = () => {

    localStorage.removeItem("activeWorkoutSession");

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      sessionData: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { sessionData } = this.state;

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Workout Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Something went wrong during your workout session.
              </p>
            </div>

            {sessionData && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  <strong>Good news!</strong> Your workout progress was saved.
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  You can try to recover your session or start fresh.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {sessionData && (
                <Button
                  variant="primary"
                  onClick={this.handleRecoverSession}
                  className="w-full"
                >
                  Recover Workout Session
                </Button>
              )}

              <Button
                variant={sessionData ? "secondary" : "primary"}
                onClick={this.handleReset}
                className="w-full"
              >
                Return to Workout Plans
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WorkoutErrorBoundary;
