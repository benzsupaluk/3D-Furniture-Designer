import { THEME_CONFIGS } from "@/constants";

export interface ThemeConfig {
  name: string;
  style: {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
  };
}

const THEME_STORAGE_KEY = "3d-room-simulator-theme";

export const getCurrentTheme = (): ThemeConfig => {
  if (typeof window === "undefined") {
    return THEME_CONFIGS[0];
  }

  const storedThemeName = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedThemeName) {
    const theme = THEME_CONFIGS.find(
      (config) => config.name === storedThemeName
    );
    if (theme) {
      return theme;
    }
  }

  return THEME_CONFIGS[0];
};

export const saveTheme = (themeName: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  const themeExists = THEME_CONFIGS.some((config) => config.name === themeName);
  if (themeExists) {
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    window.dispatchEvent(new Event("storage"));
  }
};

export const getAvailableThemes = (): ThemeConfig[] => {
  return THEME_CONFIGS;
};
