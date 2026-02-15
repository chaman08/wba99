import { Moon, Sun } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export const ThemeToggle = () => {
  const theme = useAppStore((state) => state.theme);
  const toggle = useAppStore((state) => state.setTheme);

  return (
    <button
      className="flex items-center gap-2 rounded-2xl border border-white/10 px-3 py-2 text-sm font-medium transition duration-250 hover:scale-105 hover:border-primary"
      onClick={() => toggle(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-4 w-4 text-primary" />
          Light mode
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-primary" />
          Dark mode
        </>
      )}
    </button>
  );
};
