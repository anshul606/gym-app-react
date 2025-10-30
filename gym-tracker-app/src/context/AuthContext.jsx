import React, { createContext, useEffect, useReducer } from "react";
import { authService } from "../services/authService.js";

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  LOGOUT: "LOGOUT",
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const authMethods = {

    async register(email, password, displayName) {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        const userData = await authService.register(
          email,
          password,
          displayName
        );
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });

        return userData;
      } catch (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    async login(email, password, rememberMe = true) {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

        await authService.setAuthPersistence(rememberMe);

        const userData = await authService.login(email, password);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });

        return userData;
      } catch (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    async logout() {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        await authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      } catch (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    async updatePreferences(preferences) {
      try {
        if (!state.user) {
          throw new Error("No user logged in");
        }

        await authService.updateUserPreferences(state.user.uid, preferences);

        const updatedUser = {
          ...state.user,
          ...preferences,
        };

        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: updatedUser });

        return updatedUser;
      } catch (error) {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    clearError() {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    },
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {

          const basicUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "",
            theme: "light",
            defaultRestTime: 60,
            units: "metric",
          };

          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: basicUser });

          authService
            .getUserData(firebaseUser.uid)
            .then((userData) => {
              if (userData?.preferences) {
                const updatedUser = {
                  ...basicUser,
                  ...userData.preferences,
                };
                dispatch({ type: AUTH_ACTIONS.SET_USER, payload: updatedUser });
              }
            })
            .catch((error) => {

              console.warn("Could not load user preferences:", error);
            });
        } catch (error) {
          console.error("Error loading user data:", error);
          dispatch({
            type: AUTH_ACTIONS.SET_ERROR,
            payload: "Failed to load user data",
          });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    });

    return () => unsubscribe();
  }, []);

  const contextValue = {
    ...state,
    ...authMethods,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export default AuthContext;
