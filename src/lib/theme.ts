export type ThemeMode = "dark" | "light";

const palette = {
  dark: {
    background: "#0B0F14",
    surface: "#111827",
    primary: "#3B82F6",
    "primary-subtle": "rgba(59, 130, 246, 0.24)",
    secondary: "#14B8A6",
    success: "#10B981",
    error: "#F43F5E",
    text: "#F9FAFB",
    "text-muted": "#9CA3AF",
    accent: "#38BDF8",
  },
  light: {
    background: "#F9FAFB",
    surface: "#FFFFFF",
    primary: "#2563EB",
    "primary-subtle": "rgba(37, 99, 235, 0.15)",
    secondary: "#14B8A6",
    success: "#10B981",
    error: "#EF4444",
    text: "#111827",
    "text-muted": "#6B7280",
    accent: "#38BDF8",
  },
};

export const THEME_KEY = "wba99-theme";

export const applyTheme = (mode: ThemeMode) => {
  if (typeof document === "undefined") return;
  const tokens = palette[mode];
  Object.entries(tokens).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });
  document.documentElement.dataset.theme = mode;
};

export const getStoredTheme = (): ThemeMode => {
  if (typeof localStorage === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "light" ? "light" : "dark";
};
