import { useState, useEffect } from "react";
import {
    Globe,
    Sun,
    Monitor,
    LogOut,
    ChevronRight,
    Camera,
    List,
    Package,
    CreditCard,
    MapPin,
    Bell,
    LifeBuoy,
    Shield,
    Sparkles,
    Zap,
} from "lucide-react";
import { useAuth } from "@/features/auth/auth.context";
import { useTheme } from "@/core/theme/ThemeProvider";
import UserAvatar from "@/shared/components/UserAvatar";
import { isPushSupported, getNotificationPermission, subscribeToPush } from "@/features/notifications/pushNotifications";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { useTranslation } from "react-i18next";
import i18n from "@/core/config/i18n";
import { useNavigate, Link } from "react-router-dom";

export default function SettingsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, signOut, refreshUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const [lang, setLang] = useState(i18n.language || "fr");
    const [uploading, setUploading] = useState(false);
    const [passionBio, setPassionBio] = useState("");
    const [savingBio, setSavingBio] = useState(false);
    const [pushLoading, setPushLoading] = useState(false);
    const [editingBio, setEditingBio] = useState(false);

    useEffect(() => {
        const bio = (user as any)?.user_metadata?.bio ?? "";
        setPassionBio(bio);
    }, [user]);

    // Auto-enregistrement silencieux si la permission est déjà accordée
    useEffect(() => {
        if (!isPushSupported() || getNotificationPermission() !== "granted") return;
        if (!user?.id) return;
        subscribeToPush(user.id).catch(() => {});
    }, [user?.id]);

    const savePassionBio = async () => {
        if (!user?.id) return;
        setSavingBio(true);
        try {
            const { supabase } = await import("@/core/api/supabaseApi");
            const meta = { ...((user as any).user_metadata || {}), bio: passionBio };
            const { error } = await supabase.auth.updateUser({ data: meta } as any);
            if (error) throw error;
            await refreshUser();
            const { toast } = await import("sonner");
            toast.success("Enregistré", { description: "Votre passion TEKH a été mise à jour." });
            setEditingBio(false);
        } catch (e: any) {
            const { toast } = await import("sonner");
            toast.error("Erreur", { description: e?.message || "Impossible d'enregistrer." });
        } finally {
            setSavingBio(false);
        }
    };

    const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user?.id) {
            setUploading(true);
            try {
                const { uploadAvatar, upsertProfile, supabase } = await import("@/core/api/supabaseApi");
                const publicUrl = await uploadAvatar(file);
                await upsertProfile({ id: user.id, avatar_url: publicUrl });
                await supabase.auth.updateUser({ data: { avatar_url: publicUrl } } as any);
                await refreshUser();
            } catch (err) {
                console.error("Upload failed", err);
            } finally {
                setUploading(false);
            }
        }
    };

    const changeLanguage = (newLang: string) => {
        setLang(newLang);
        i18n.changeLanguage(newLang);
    };

    const pushGranted = getNotificationPermission() === "granted";
    const userName = (user as any)?.user_metadata?.full_name || "Utilisateur TEKH+";
    const userEmail = (user as any)?.email || "";

    const navSections = [
        {
            title: t('settings.navigate', 'Mes activités'),
            items: [
                {
                    icon: List,
                    label: t('settings.history', 'Historique'),
                    desc: t('settings.history_desc', 'Transactions passées'),
                    path: "/historique",
                    emoji: "📋",
                    color: "from-violet-500 to-purple-600",
                },
                {
                    icon: Package,
                    label: t('settings.orders', 'Commandes'),
                    desc: t('settings.orders_desc', 'Achats en cours'),
                    path: "/commandes",
                    emoji: "📦",
                    color: "from-amber-500 to-orange-500",
                },
                {
                    icon: CreditCard,
                    label: t('settings.payment', 'Paiement'),
                    desc: t('settings.payment_desc', 'Méthodes de paiement'),
                    path: "/panier",
                    emoji: "💳",
                    color: "from-blue-500 to-cyan-500",
                },
                {
                    icon: MapPin,
                    label: t('settings.addresses', 'Adresses'),
                    desc: t('settings.addresses_desc', 'Lieux de réception'),
                    path: "/profile",
                    emoji: "📍",
                    color: "from-rose-500 to-pink-500",
                },
            ]
        },
        {
            title: t('settings.preferences', 'Aide & Préférences'),
            items: [
                {
                    icon: Bell,
                    label: t('settings.alerts', 'Notifications'),
                    desc: pushGranted ? 'Activées ✓' : t('settings.alerts_desc', 'Alertes et offres'),
                    path: "/notifications",
                    emoji: "🔔",
                    color: "from-emerald-500 to-teal-500",
                },
                {
                    icon: LifeBuoy,
                    label: t('settings.support', 'Support'),
                    desc: t('settings.support_desc', 'Aide & assistance'),
                    path: "/contact",
                    emoji: "🆘",
                    color: "from-sky-500 to-blue-500",
                },
            ]
        }
    ];

    const themeOptions = [
        { value: "light", label: "Clair", icon: Sun },
        { value: "dark", label: "Sombre", icon: Moon },
        { value: "system", label: "Système", icon: Monitor },
    ];

    return (
        <div className="min-h-dvh bg-background pb-32 pt-safe">
            <div className="max-w-xl mx-auto text-foreground">

                {/* ── Hero profil ── */}
                <div className="relative overflow-hidden">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-black dark:from-black dark:via-emerald-950 dark:to-black" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,255,65,0.12),transparent_60%)]" />

                    <div className="relative px-5 pt-8 pb-10">
                        {/* Avatar + info */}
                        <div className="flex items-center gap-5">
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 rounded-3xl ring-2 ring-[#00FF41]/30 shadow-[0_0_30px_rgba(0,255,65,0.15)] overflow-hidden">
                                    <UserAvatar user={user} size="xl" className="w-full h-full object-cover" />
                                </div>
                                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#00FF41] text-black flex items-center justify-center rounded-xl shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                    {uploading ? (
                                        <div className="w-3 h-3 border-2 border-black border-t-transparent animate-spin rounded-full" />
                                    ) : (
                                        <Camera className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} disabled={uploading} />
                                </label>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-black text-white tracking-tight truncate">
                                        {userName}
                                    </p>
                                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-[#00FF41]/20 border border-[#00FF41]/30">
                                        <Zap className="w-3 h-3 text-[#00FF41]" />
                                    </span>
                                </div>
                                <p className="text-sm text-emerald-300/70 font-medium truncate mt-0.5">{userEmail}</p>
                            </div>
                        </div>

                        {/* Bio / Passion TEKH */}
                        <div className="mt-5">
                            {passionBio?.trim() && !editingBio ? (
                                <div
                                    className="flex items-start gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 cursor-pointer"
                                    onClick={() => setEditingBio(true)}
                                >
                                    <Sparkles className="w-4 h-4 text-[#00FF41] shrink-0 mt-0.5" />
                                    <p className="text-sm text-emerald-100/80 font-medium flex-1 leading-snug">{passionBio}</p>
                                    <span className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-widest shrink-0">modifier</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                                        Décrivez votre passion TEKH
                                    </Label>
                                    <textarea
                                        value={passionBio}
                                        onChange={(e) => setPassionBio(e.target.value)}
                                        placeholder="Passionné de tech, amateur d'iPhone..."
                                        className="w-full min-h-[80px] rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#00FF41]/30 resize-none"
                                    />
                                    <div className="flex gap-2">
                                        {editingBio && (
                                            <button
                                                onClick={() => { setEditingBio(false); setPassionBio((user as any)?.user_metadata?.bio ?? ""); }}
                                                className="flex-1 h-10 rounded-xl border border-white/10 text-white/60 text-sm font-bold"
                                            >
                                                Annuler
                                            </button>
                                        )}
                                        <Button
                                            onClick={savePassionBio}
                                            disabled={savingBio}
                                            className="flex-1 h-10 rounded-xl bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black text-sm border-0 shadow-[0_0_20px_rgba(0,255,65,0.3)]"
                                        >
                                            {savingBio ? "Enregistrement…" : "Enregistrer"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Sections navigation ── */}
                <div className="px-4 pt-6 space-y-6">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 px-1">
                                {section.title}
                            </h3>
                            <div className="rounded-3xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/40 active:bg-muted/60 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md text-lg`}>
                                                {item.emoji}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[15px] text-foreground tracking-tight">{item.label}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* ── Système ── */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 px-1">
                            {t('settings.system', 'Système')}
                        </h3>
                        <div className="rounded-3xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">

                            {/* Thème */}
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-lg shadow-md">
                                        🎨
                                    </div>
                                    <div>
                                        <p className="font-bold text-[15px] text-foreground tracking-tight">{t('settings.theme', 'Apparence')}</p>
                                        <p className="text-[11px] text-muted-foreground font-medium">Thème clair ou sombre</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/30">
                                    {themeOptions.map(({ value, icon: Icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => setTheme(value as any)}
                                            className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all ${
                                                theme === value
                                                    ? "bg-emerald-500 text-white shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Langue */}
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg shadow-md">
                                        🌍
                                    </div>
                                    <div>
                                        <p className="font-bold text-[15px] text-foreground tracking-tight">{t('settings.language', 'Langue')}</p>
                                        <p className="text-[11px] text-muted-foreground font-medium">Français / English</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/30">
                                    {["fr", "en"].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => changeLanguage(l)}
                                            className={`px-3 h-7 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                                                lang === l
                                                    ? "bg-emerald-500 text-white shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notifications push */}
                            {isPushSupported() && (
                                <div className="flex items-center justify-between px-4 py-3.5">
                                    <div className="flex items-center gap-3.5">
                                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${pushGranted ? "from-emerald-500 to-teal-600" : "from-zinc-600 to-zinc-700"} flex items-center justify-center text-lg shadow-md`}>
                                            {pushGranted ? "🔔" : "🔕"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[15px] text-foreground tracking-tight">Notifications push</p>
                                            <p className="text-[11px] text-muted-foreground font-medium">
                                                {pushGranted ? "Activées — vous recevez les alertes" : "Désactivées — deals & promos"}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        disabled={pushLoading || pushGranted}
                                        onClick={async () => {
                                            setPushLoading(true);
                                            const { toast } = await import("sonner");
                                            const err = await subscribeToPush(user?.id ?? null);
                                            if (err) toast.error(err);
                                            else toast.success("Notifications activées !", { description: "Vous serez alerté des nouveaux deals." });
                                            setPushLoading(false);
                                        }}
                                        className={`rounded-xl h-8 px-4 text-xs font-black border-0 ${
                                            pushGranted
                                                ? "bg-emerald-500/10 text-emerald-500 cursor-default"
                                                : "bg-emerald-500 text-white shadow-[0_0_15px_rgba(0,255,65,0.2)] hover:opacity-90"
                                        }`}
                                    >
                                        {pushLoading ? "…" : pushGranted ? "Activé ✓" : "Activer"}
                                    </Button>
                                </div>
                            )}

                            {/* Sécurité */}
                            <div className="flex items-center justify-between px-4 py-3.5 opacity-60">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-lg shadow-md">
                                        🔐
                                    </div>
                                    <div>
                                        <p className="font-bold text-[15px] text-foreground tracking-tight">Sécurité</p>
                                        <p className="text-[11px] text-muted-foreground font-medium">Mot de passe & 2FA</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground bg-muted px-2.5 py-1 rounded-full uppercase tracking-widest">Bientôt</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Déconnexion ── */}
                    <button
                        type="button"
                        onClick={() => signOut().then(() => navigate("/login"))}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-3xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 active:scale-[0.99] transition-all group"
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-lg shadow-md">
                                🚪
                            </div>
                            <div className="text-left">
                                <p className="font-black text-rose-500 text-[15px] tracking-tight">{t('profile.logout', 'Déconnexion')}</p>
                                <p className="text-[11px] text-rose-400/60 font-medium">{t('settings.logout_desc', 'Quitter votre session')}</p>
                            </div>
                        </div>
                        <LogOut className="w-4 h-4 text-rose-500/40 group-hover:text-rose-500 transition-colors" />
                    </button>

                    {/* Version */}
                    <div className="flex items-center justify-center gap-2 py-6">
                        <Shield className="w-3 h-3 text-muted-foreground/30" />
                        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
                            TΞKΗ+ v3.0.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
