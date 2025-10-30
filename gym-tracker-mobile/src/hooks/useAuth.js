import { useAuthContext } from "./useAuthContext.js";

export function useAuth() {
  const context = useAuthContext();

  return {

    user: context.user,
    loading: context.loading,
    error: context.error,

    isAuthenticated: !!context.user,
    isLoading: context.loading,
    hasError: !!context.error,

    register: context.register,
    login: context.login,
    logout: context.logout,
    updatePreferences: context.updatePreferences,
    clearError: context.clearError,

    getUserId: () => context.user?.uid || null,
    getUserEmail: () => context.user?.email || null,
    getUserDisplayName: () => context.user?.displayName || "",
    getUserPreferences: () => ({
      theme: context.user?.theme || "light",
      defaultRestTime: context.user?.defaultRestTime || 60,
      units: context.user?.units || "metric",
    }),
  };
}

export default useAuth;
