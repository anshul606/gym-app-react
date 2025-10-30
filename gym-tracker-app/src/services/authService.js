import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";

export const authService = {

  async register(email, password, displayName) {
    try {

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || "",
        createdAt: new Date(),
        preferences: {
          theme: "light",
          defaultRestTime: 60,
          units: "metric",
        },
      };

      await setDoc(doc(db, "users", user.uid), userDoc);

      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName || "",
        ...userDoc.preferences,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let preferences = {
        theme: "light",
        defaultRestTime: 60,
        units: "metric",
      };

      if (userDoc.exists()) {
        preferences = userDoc.data().preferences || preferences;
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        ...preferences,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Failed to sign out. Please try again.");
    }
  },

  async getUserData(uid) {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  },

  async updateUserPreferences(uid, preferences) {
    try {
      const userDocRef = doc(db, "users", uid);

      if (preferences.displayName !== undefined) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await updateProfile(currentUser, {
            displayName: preferences.displayName,
          });
        }

        await setDoc(
          userDocRef,
          {
            displayName: preferences.displayName,
            preferences,
          },
          { merge: true }
        );
      } else {

        await setDoc(userDocRef, { preferences }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating user preferences:", error);
      throw new Error("Failed to update preferences. Please try again.");
    }
  },

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  async setAuthPersistence(rememberMe = true) {
    try {
      const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;

      await setPersistence(auth, persistence);
    } catch (error) {
      console.error("Error setting auth persistence:", error);

    }
  },

  getCurrentUser() {
    return auth.currentUser;
  },
};

function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    default:
      return "An error occurred. Please try again.";
  }
}

export default authService;
