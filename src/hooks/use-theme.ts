import { useState, useEffect } from "react";
import { THEME_CONFIGS } from "@/constants";
import {
  getCurrentTheme,
  saveTheme,
  getAvailableThemes,
  ThemeConfig,
} from "@/utils/theme";

export const useTheme = () => {
  // Use default theme for initial state to prevent hydration mismatch
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEME_CONFIGS[0]);
  const [themes] = useState<ThemeConfig[]>(getAvailableThemes());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);
    // Load actual theme from localStorage
    setCurrentTheme(getCurrentTheme());
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Update theme when localStorage changes (e.g., from another tab)
    const handleStorageChange = () => {
      setCurrentTheme(getCurrentTheme());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isClient]);

  const selectTheme = (themeName: string) => {
    saveTheme(themeName);
    setCurrentTheme(getCurrentTheme());
  };

  return {
    currentTheme,
    themes,
    selectTheme,
    isClient,
  };
};
