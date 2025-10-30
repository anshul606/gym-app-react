import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useTheme } from "../hooks";
import useSwipeGesture from "../hooks/useSwipeGesture";
import { Button, Input, Modal } from "../components/common";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updatePreferences } = useAuth();
  const { theme, setLightTheme, setDarkTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSaving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [defaultRestTime, setDefaultRestTime] = useState(
    user?.defaultRestTime || 60
  );
  const [units, setUnits] = useState(user?.units || "metric");

  useEffect(() => {
    if (user) {
      setDefaultRestTime(user.defaultRestTime || 60);
      setUnits(user.units || "metric");
    }
  }, [user]);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const pages = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/workout-plans", name: "Workout Plans" },
    { path: "/progress", name: "Progress" },
    { path: "/profile", name: "Profile" },
  ];
  const currentPageIndex = 3;

  const handleSwipeLeft = () => {

    if (currentPageIndex < pages.length - 1) {
      navigate(pages[currentPageIndex + 1].path);
    }
  };

  const handleSwipeRight = () => {
    if (currentPageIndex > 0) {
      navigate(pages[currentPageIndex - 1].path);
    }
  };

  const { ref: swipeRef } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minSwipeDistance: 75,
    maxSwipeTime: 400,
  });

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await updatePreferences({ displayName });
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (selectedTheme === "light") {
        setLightTheme();
      } else {
        setDarkTheme();
      }

      await updatePreferences({
        theme: selectedTheme,
        defaultRestTime: parseInt(defaultRestTime, 10),
        units,
      });

      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayName(user?.displayName || "");
    setIsEditing(false);
    setError("");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to logout");
      setShowLogoutModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] safe-area-bottom">
      <div
        ref={swipeRef}
        className="max-w-4xl mx-auto px-4 py-8 pb-40 container-safe"
      >
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
          Profile
        </h1>

        {}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Account Information
            </h2>
            {!isEditing && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[var(--error-bg)] border border-[var(--error)] rounded-lg">
              <p className="text-[var(--error)] text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-[var(--success-bg)] border border-[var(--success)] rounded-lg">
              <p className="text-[var(--success)] text-sm">{successMessage}</p>
            </div>
          )}

          <div className="space-y-4">
            {}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Email
              </label>
              <div className="px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-primary)]">
                {user?.email}
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Display Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              ) : (
                <div className="px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-primary)]">
                  {user?.displayName || "Not set"}
                </div>
              )}
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                User ID
              </label>
              <div className="px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg text-[var(--text-secondary)] text-sm font-mono break-all">
                {user?.uid}
              </div>
            </div>
          </div>

          {}
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={isSaving}
                fullWidth
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancelEdit}
                disabled={isSaving}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
            Preferences & Settings
          </h2>

          <div className="space-y-6">
            {}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTheme("light")}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${
                      selectedTheme === "light"
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary-bg)]"
                        : "border-[var(--border-secondary)] bg-[var(--bg-tertiary)]"
                    }
                  `}
                >
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-8 h-8 text-[var(--text-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Light
                  </p>
                </button>

                <button
                  onClick={() => setSelectedTheme("dark")}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${
                      selectedTheme === "dark"
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary-bg)]"
                        : "border-[var(--border-secondary)] bg-[var(--bg-tertiary)]"
                    }
                  `}
                >
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-8 h-8 text-[var(--text-primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Dark
                  </p>
                </button>
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Default Rest Time (seconds)
              </label>
              <Input
                type="number"
                value={defaultRestTime}
                onChange={(e) => setDefaultRestTime(e.target.value)}
                min="0"
                max="600"
                placeholder="60"
              />
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Default rest time between sets (0-600 seconds)
              </p>
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                Units
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUnits("metric")}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${
                      units === "metric"
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary-bg)]"
                        : "border-[var(--border-secondary)] bg-[var(--bg-tertiary)]"
                    }
                  `}
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Metric (kg)
                  </p>
                </button>

                <button
                  onClick={() => setUnits("imperial")}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${
                      units === "imperial"
                        ? "border-[var(--accent-primary)] bg-[var(--accent-primary-bg)]"
                        : "border-[var(--border-secondary)] bg-[var(--bg-tertiary)]"
                    }
                  `}
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Imperial (lbs)
                  </p>
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              disabled={isSaving}
              fullWidth
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] p-6 mb-8">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Account Actions
          </h2>
          <Button
            variant="danger"
            onClick={() => setShowLogoutModal(true)}
            fullWidth
          >
            Logout
          </Button>
        </div>

        {}
        <div className="text-center py-8 border-t border-[var(--border-primary)]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-[var(--accent-primary)]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              Crafted with ❤️
            </p>
          </div>
          <p className="text-[var(--text-primary)] font-semibold mb-1">
            Developed by Anshul Bansal
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            © 2025 • Built with React & Firebase
          </p>
        </div>

        {}
        <Modal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          title="Confirm Logout"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </>
          }
        >
          <p className="text-[var(--text-primary)]">
            Are you sure you want to logout? You'll need to sign in again to
            access your workout data.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;
