import { createRoot } from "react-dom/client";
import App from "@/app/App";
import "@/app/index.css";
import "@/core/config/i18n";

createRoot(document.getElementById("root")!).render(<App />);
