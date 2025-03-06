import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get saved theme from localStorage or default to 'system'
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Update actual theme based on system preference and user choice
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const activeTheme = theme === "system" ? systemTheme : theme;

    root.classList.remove("light", "dark");
    root.classList.add(activeTheme);

    localStorage.setItem("theme", theme);
  }, [theme, systemTheme]);

  // Function to toggle between light and dark
  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  // Function to set theme directly
  const setThemeDirectly = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    systemTheme,
    activeTheme: theme === "system" ? systemTheme : theme,
    toggleTheme,
    setTheme: setThemeDirectly,
  };
}
