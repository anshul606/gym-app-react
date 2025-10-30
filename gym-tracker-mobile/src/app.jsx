import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { logFirebaseStatus } from "./utils/firebaseTest.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ProtectedRoute } from "./components/auth/index.js";
import { BottomNavigation, LoadingSpinner } from "./components/common/index.js";
import { useAuth } from "./hooks/useAuth.js";

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const WorkoutPlans = lazy(() => import("./pages/WorkoutPlans.jsx"));
const ActiveWorkout = lazy(() => import("./pages/ActiveWorkout.jsx"));
const Progress = lazy(() => import("./pages/Progress.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const WorkoutHistory = lazy(() => import("./pages/WorkoutHistory.jsx"));

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}

function ProtectedLayout({ children }) {
  return (
    <>
      <main id="main-content">{children}</main>
      <BottomNavigation />
    </>
  );
}

function App() {
  useEffect(() => {

    if (import.meta.env.MODE === "development") {
      logFirebaseStatus();
    }
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {}
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>

          <Suspense
            fallback={
              <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <LoadingSpinner size="large" />
              </div>
            }
          >
            <Routes>
              {}
              <Route path="/" element={<RootRedirect />} />

              {}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Dashboard />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout-plans"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <WorkoutPlans />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/active-workout"
                element={
                  <ProtectedRoute>
                    <ActiveWorkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Progress />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Profile />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/workout-history/:sessionId"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <WorkoutHistory />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />

              {}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
