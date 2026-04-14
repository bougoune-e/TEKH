import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/core/api/supabaseApi";
import logo from "@/assets/logos/robott.jpeg";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string || "")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

/**
 * /auth/callback — landing page after OAuth (Google) redirect.
 * Supabase puts tokens in the URL hash (#access_token=…) or query (?code=…).
 * Shows a branded TEKH+ loading screen while processing, then redirects
 * to /admin (if admin) or /profile (regular user).
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState("Connexion en cours…");

    useEffect(() => {
        const handleCallback = async () => {
            // Wait a bit for Supabase to process the tokens from the URL
            await new Promise((r) => setTimeout(r, 500));

            const { data, error } = await supabase.auth.getSession();

            if (error || !data.session) {
                setStatus("Vérification de votre compte…");
                // Retry after a delay (mobile WebView can be slow)
                await new Promise((r) => setTimeout(r, 1500));
                const retry = await supabase.auth.getSession();
                if (retry.data.session?.user) {
                    setStatus("Bienvenue !");
                    await new Promise((r) => setTimeout(r, 600));
                    redirectUser(retry.data.session.user);
                    return;
                }
                // No session — send back to login
                setStatus("Échec de connexion. Redirection…");
                await new Promise((r) => setTimeout(r, 1000));
                navigate("/login", { replace: true });
                return;
            }

            setStatus("Bienvenue !");
            await new Promise((r) => setTimeout(r, 600));
            redirectUser(data.session.user);
        };

        const redirectUser = (user: any) => {
            const email = (user.email || user.user_metadata?.email || "").toLowerCase();
            if (ADMIN_EMAILS.includes(email)) {
                navigate("/admin", { replace: true });
            } else {
                navigate("/profile", { replace: true });
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "#000000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2rem",
                zIndex: 9999,
            }}
        >
            {/* Ambient glow */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 480,
                    height: 480,
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, rgba(0,255,65,0.12) 0%, transparent 70%)",
                    animation: "authGlow 3s ease-in-out infinite",
                    pointerEvents: "none",
                }}
            />

            {/* Logo */}
            <div style={{ position: "relative", zIndex: 1 }}>
                {/* Pulse ring */}
                <div
                    style={{
                        position: "absolute",
                        inset: -14,
                        borderRadius: 999,
                        border: "1.5px solid rgba(0,255,65,0.25)",
                        animation: "authRing 2.4s ease-in-out infinite",
                    }}
                />
                <img
                    src={logo}
                    alt="TEKH+"
                    style={{
                        width: 96,
                        height: 96,
                        borderRadius: 26,
                        display: "block",
                        position: "relative",
                        zIndex: 1,
                        boxShadow:
                            "0 0 0 1px rgba(0,255,65,0.18), 0 0 40px rgba(0,255,65,0.10), 0 20px 60px rgba(0,0,0,0.6)",
                    }}
                />
            </div>

            {/* Brand */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: "2.2rem",
                    fontWeight: 900,
                    color: "#ffffff",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                }}
            >
                TΞKΗ<span style={{ color: "#00FF41", textShadow: "0 0 20px rgba(0,255,65,0.6)" }}>+</span>
            </div>

            {/* Status text */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    animation: "authFade 1.5s ease-in-out infinite",
                }}
            >
                {status}
            </div>

            {/* Progress bar */}
            <div
                style={{
                    position: "absolute",
                    bottom: "10%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 56,
                    height: 2,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    overflow: "hidden",
                    zIndex: 1,
                }}
            >
                <div
                    style={{
                        height: "100%",
                        background: "linear-gradient(to right, #064e3b, #00FF41)",
                        borderRadius: 2,
                        animation: "authBar 2s cubic-bezier(0.4,0,0.2,1) forwards",
                    }}
                />
            </div>

            {/* Inline keyframes */}
            <style>{`
        @keyframes authGlow {
          0%, 100% { opacity: 0.7; transform: translate(-50%,-50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%,-50%) scale(1.1); }
        }
        @keyframes authRing {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(1.06); }
        }
        @keyframes authFade {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @keyframes authBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
        </div>
    );
}
