import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const initializeCapacitor = async () => {
  if (!isNativePlatform()) {
    console.log("Running in web mode");
    return;
  }

  try {

    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0f172a" });

    setTimeout(async () => {
      await SplashScreen.hide();
    }, 1000);

    Keyboard.setAccessoryBarVisible({ isVisible: false });

    console.log("Capacitor initialized successfully");
  } catch (error) {
    console.error("Error initializing Capacitor:", error);
  }
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};
