import { useState, useEffect } from "react";
import { supabase } from "@/core/api/supabaseApi";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { CardContent } from "@/shared/ui/card";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import MotionRings from "@/shared/components/MotionRings";

/**
 * /reset-password — Page atterrissage lien email "Mot de passe oublié".
 * Supabase redirige ici avec un token dans le hash (#access_token=...) ou
 * via l'event PASSWORD_RECOVERY dans onAuthStateChange.
 */
export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    // Supabase processes the password-reset token on page load.
    // Wait for the session to be available before allowing form submission.
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setSessionReady(true);
                return;
            }
            // Retry after PKCE code exchange (can take up to 2s on WebView)
            const t = setTimeout(async () => {
                const { data: d2 } = await supabase.auth.getSession();
                setSessionReady(!!d2.session);
            }, 2000);
            return () => clearTimeout(t);
        };
        checkSession();

        const { data } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setSessionReady(true);
            }
        });
        return () => data?.subscription?.unsubscribe?.();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }
        if (password !== confirm) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setLoading(false);

        if (updateError) {
            setError("Erreur : " + updateError.message);
            return;
        }

        setSuccess(true);
        // Sign out old session and redirect to login after success
        await supabase.auth.signOut();
        setTimeout(() => navigate("/login", { replace: true }), 2500);
    };

    if (success) {
        return (
            <section className="min-h-dvh bg-white dark:bg-black flex flex-col items-center justify-center p-6">
                <MotionRings className="mb-8">
                    <div className="text-center space-y-4 z-20">
                        <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                        <h2 className="text-2xl font-black text-black dark:text-white">Mot de passe mis à jour</h2>
                        <p className="text-muted-foreground text-sm max-w-xs">
                            Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la connexion.
                        </p>
                    </div>
                </MotionRings>
            </section>
        );
    }

    return (
        <section className="min-h-dvh bg-white dark:bg-black flex flex-col items-center justify-center p-6 pb-28 md:pb-6 overflow-hidden">
            <MotionRings className="mb-12">
                <div className="text-center space-y-2 z-20">
                    <h2 className="text-4xl font-black tracking-tighter text-black dark:text-white font-sans uppercase">
                        Nouveau mot de passe
                    </h2>
                    <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
                    <p className="text-sm text-muted-foreground mt-3 max-w-xs">
                        Choisissez un nouveau mot de passe pour votre compte TΞKΗ+.
                    </p>
                </div>
            </MotionRings>

            <div className="w-full max-w-[400px] z-10">
                <CardContent className="p-0 space-y-6">
                    {!sessionReady ? (
                        <div className="text-center space-y-3 py-4">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground">Vérification de votre lien…</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* New password */}
                            <div className="relative">
                                <Input
                                    type={showPwd ? "text" : "password"}
                                    placeholder="Nouveau mot de passe (min. 6 caractères)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="h-14 px-6 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary font-bold text-base text-black dark:text-white font-sans"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((v) => !v)}
                                    className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-foreground"
                                >
                                    {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Confirm password */}
                            <Input
                                type={showPwd ? "text" : "password"}
                                placeholder="Confirmer le mot de passe"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                minLength={6}
                                className="h-14 px-6 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary font-bold text-base text-black dark:text-white font-sans"
                            />

                            {/* Match indicator */}
                            {confirm.length > 0 && (
                                <div className={`flex items-center gap-2 text-xs font-bold ${password === confirm ? "text-primary" : "text-rose-500"}`}>
                                    {password === confirm
                                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> Les mots de passe correspondent</>
                                        : <><AlertCircle className="w-3.5 h-3.5" /> Les mots de passe ne correspondent pas</>
                                    }
                                </div>
                            )}

                            {error && (
                                <div className="text-rose-600 text-[13px] font-bold text-center">{error}</div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || password !== confirm || password.length < 6}
                                className="w-full h-14 rounded-full bg-[#064e3b] dark:bg-[#059669] text-white font-black text-lg hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl font-sans disabled:opacity-50"
                            >
                                {loading ? "Mise à jour…" : "Valider le nouveau mot de passe"}
                            </Button>
                        </form>
                    )}

                    <p className="text-center text-xs text-muted-foreground">
                        <Link to="/login" className="font-bold text-primary hover:underline">
                            Retour à la connexion
                        </Link>
                    </p>
                </CardContent>
            </div>
        </section>
    );
}
