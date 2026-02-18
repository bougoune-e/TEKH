import { useTheme } from "@/theme/ThemeProvider";

const EclipseIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M12 3a9 9 0 0 1 0 18V3z" />
  </svg>
);

const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      aria-label={isDark ? "Mode clair" : "Mode sombre"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`inline-flex items-center justify-center h-10 w-10 rounded-full border-2 border-black dark:border-white bg-white dark:bg-black shadow-lg hover:scale-110 active:scale-95 transition-all ${className}`}
    >
      <EclipseIcon className="h-5 w-5 text-black dark:text-white" />
    </button>
  );
};

export default ThemeToggle;
