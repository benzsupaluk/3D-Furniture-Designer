import { useState, useEffect } from "react";
import { THEME_CONFIGS } from "@/constants";
import {
  getCurrentTheme,
  saveTheme,
  getAvailableThemes,
  ThemeConfig,
} from "@/utils/theme";

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(
    THEME_CONFIGS[0]
  );
  const [themes] = useState<ThemeConfig[]>(getAvailableThemes());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentTheme(getCurrentTheme());
  }, []);

  useEffect(() => {
    if (!isClient) return;

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
