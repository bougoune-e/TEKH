import { useState } from "react";
import { supabase } from "@/lib/supabaseApi";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logos/robott.jpeg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginWithGoogle = async () => {
    setError("");
    if (!isSupabaseConfigured) {
      setError("Connexion Google indisponible: configuration Supabase manquante.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/deals` } as any });
    if (error) setError(error.message);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Connexion échouée : " + error.message);
      return;
    }

    if (data?.user) {
      navigate("/deals");
    }
  };

  const [passwordEntropy, setPasswordEntropy] = useState(0);

  const calculateEntropy = (pass: string) => {
    let strength = 0;
    if (pass.length > 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    setPasswordEntropy(strength);
  };

  return (
    <section className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6">
      {/* App Identity */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <Link to="/" className="flex flex-col items-center gap-3">
          <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-black dark:border-white">
            <img src={logo} alt="TΞKΗ+" className="h-full w-full object-cover" />
          </div>
          <span className="text-3xl font-black tracking-tighter text-black dark:text-white">TΞKΗ<span className="text-primary">+</span></span>
        </Link>
      </div>

      <Card className="w-full max-w-[400px] border-0 shadow-none dark:bg-transparent">
        <CardHeader className="text-center p-0 mb-8">
          <CardTitle className="text-2xl font-black tracking-tight text-black dark:text-white">Bon retour !</CardTitle>
          <CardDescription className="text-slate-500 font-bold">Connectez-vous pour continuer</CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-8">
          {/* Priority 1: Google Login */}
          <button
            onClick={loginWithGoogle}
            className="w-full h-14 bg-white hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            <span className="font-black text-black text-base">Continuer avec Google</span>
          </button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100 dark:border-zinc-800" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-black px-6 text-slate-400 font-black tracking-widest">ou</span></div>
          </div>

          {/* Simplified Email Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 px-6 rounded-[8px] bg-zinc-50 dark:bg-zinc-900 border-0 focus:ring-2 focus:ring-black dark:focus:ring-white font-bold transition-all text-base"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  calculateEntropy(e.target.value);
                }}
                required
                className="h-14 px-6 rounded-[8px] bg-zinc-50 dark:bg-zinc-900 border-0 focus:ring-2 focus:ring-black dark:focus:ring-white font-bold transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-black dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" id="gdpr" required className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 accent-black dark:accent-white" />
              <label htmlFor="gdpr" className="text-xs font-bold text-slate-500 cursor-pointer">
                J'accepte les <Link to="/cgu" className="text-black dark:text-white hover:underline">CGU</Link> et la <Link to="/politique-confidentialite" className="text-black dark:text-white hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            {error && (
              <div className="text-rose-600 text-[13px] font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 rounded-full bg-black dark:bg-white text-white dark:text-black font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl" disabled={loading}>
              {loading ? "Chargement..." : "Se connecter"}
            </Button>
          </form>

          {/* Discreete Tech Links */}
          <div className="flex flex-col gap-4 text-center">
            <button className="text-[13px] font-black text-slate-400 hover:text-black dark:hover:text-white transition-colors">
              Utiliser un lien magique 🪄
            </button>
            <button className="text-[13px] font-black text-slate-400 hover:text-black dark:hover:text-white transition-colors">
              Connexion Passkey 🔑
            </button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-12 text-[14px] font-bold text-slate-500">
        Nouveau sur TEKH+ ? <Link to="/signup" className="text-black dark:text-white font-black hover:underline ml-1">Créer un compte</Link>
      </p>
    </section>
  );
}
