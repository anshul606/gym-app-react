import { auth, db, getFirebaseConfig } from "../services/firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const testFirebaseConnection = async () => {
  const results = {
    config: null,
    auth: false,
    firestore: false,
    errors: [],
  };

  try {

    results.config = getFirebaseConfig();
    console.log("Firebase config loaded:", results.config);

    try {
      await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            unsubscribe();
            resolve(user);
          },
          (error) => {
            unsubscribe();
            reject(error);
          }
        );
      });
      results.auth = true;
      console.log("Firebase Auth connection successful");
    } catch (error) {
      results.errors.push(`Auth connection failed: ${error.message}`);
      console.error("Firebase Auth connection failed:", error);
    }

    try {

      if (db) {
        results.firestore = true;
        console.log("Firebase Firestore connection successful");
      }
    } catch (error) {
      results.errors.push(`Firestore connection failed: ${error.message}`);
      console.error("Firebase Firestore connection failed:", error);
    }
  } catch (error) {
    results.errors.push(`General Firebase error: ${error.message}`);
    console.error("General Firebase error:", error);
  }

  return results;
};

export const logFirebaseStatus = async () => {
  console.log("🔥 Testing Firebase Connection...");
  const results = await testFirebaseConnection();

  console.log("📊 Firebase Connection Results:");
  console.log("  Config loaded:", !!results.config);
  console.log("  Auth connected:", results.auth);
  console.log("  Firestore connected:", results.firestore);

  if (results.errors.length > 0) {
    console.log("  Errors:", results.errors);
  }

  return results;
};
