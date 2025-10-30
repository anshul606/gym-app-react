import React from "react";
import { Button } from "./Button";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {

    console.error("Global Error Boundary caught an error:", error, errorInfo);

    const errorCount = this.state.errorCount + 1;

    this.setState({
      error,
      errorInfo,
      errorCount,
    });

    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {

    try {
      const errorReport = {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      if (process.env.NODE_ENV === "development") {
        console.log("Error Report:", errorReport);
      }

    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleClearData = () => {
    if (
      window.confirm(
        "This will clear all local data and reload the app. Continue?"
      )
    ) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
      } catch (e) {
        console.error("Failed to clear storage:", e);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      const { errorCount } = this.state;
      const isRecurringError = errorCount > 2;

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                We encountered an unexpected error. Don't worry, your data is
                safe.
              </p>
            </div>

            {isRecurringError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                  <strong>Recurring Error Detected</strong>
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  This error has occurred multiple times. You may need to clear
                  your local data.
                </p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="w-full"
              >
                Try Again
              </Button>

              <Button
                variant="secondary"
                onClick={this.handleReload}
                className="w-full"
              >
                Reload Application
              </Button>

              {isRecurringError && (
                <Button
                  variant="danger"
                  onClick={this.handleClearData}
                  className="w-full"
                >
                  Clear Data & Reload
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>If the problem persists, please contact support.</p>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Error Message:
                    </h3>
                    <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  {this.state.error.stack && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Stack Trace:
                      </h3>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Component Stack:
                      </h3>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
