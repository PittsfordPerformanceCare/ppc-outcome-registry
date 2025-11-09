import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      return stored === "true";
    }
    
    // Check if it's evening (6 PM to 6 AM)
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save preference
    localStorage.setItem("darkMode", String(isDark));
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  return { isDark, toggleDarkMode };
}
