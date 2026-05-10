import { useState, useEffect } from "react";
import {
    Globe,
    Sun,
    Moon,
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
    Lock,
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

    useEffect(() => {
        if (!isPushSupported() || getNotificationPermission() !== "granted") return;
        if (!user?.id) return;
        subscribeToPush(user.id).catch(() => { });
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
            toast.success("Profil mis à jour");
            setEditingBio(false);
        } catch (e: any) {
            const { toast } = await import("sonner");
            toast.error(e?.message || "Impossible d'enregistrer.");
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

    const themeOptions = [
        { value: "light", label: "Clair", icon: Sun },
        { value: "dark", label: "Sombre", icon: Moon },
    ];

    const navSections = [
        {
            title: t('settings.navigate', 'Activités'),
            items: [
                { icon: List, label: t('settings.history', 'Historique'), desc: t('settings.history_desc', 'Transactions passées'), path: "/historique" },
                { icon: Package, label: t('settings.orders', 'Commandes'), desc: t('settings.orders_desc', 'Achats en cours'), path: "/commandes" },
                { icon: CreditCard, label: t('settings.payment', 'Paiement'), desc: t('settings.payment_desc', 'Méthodes de paiement'), path: "/panier" },
                { icon: MapPin, label: t('settings.addresses', 'Adresses'), desc: t('settings.addresses_desc', 'Lieux de réception'), path: "/profile" },
            ],
        },
        {
            title: t('settings.preferences', 'Préférences'),
            items: [
                { icon: Bell, label: t('settings.alerts', 'Notifications'), desc: pushGranted ? 'Activées' : t('settings.alerts_desc', 'Alertes et offres'), path: "/notifications" },
                { icon: LifeBuoy, label: t('settings.support', 'Support'), desc: t('settings.support_desc', 'Aide & assistance'), path: "/contact" },
            ],
        },
    ];

    return (
        <div className="min-h-dvh bg-background pb-32 pt-safe">
            <div className="max-w-xl mx-auto">

                {/* ── Profil ── */}
                <div className="px-5 pt-8 pb-6">
                    <h1 className="text-2xl font-black tracking-tight text-foreground mb-6">Paramètres</h1>

                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <UserAvatar user={user} size="xl" className="w-16 h-16 rounded-2xl" />
                            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-foreground text-background flex items-center justify-center rounded-lg shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                {uploading
                                    ? <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent animate-spin rounded-full" />
                                    : <Camera className="h-3 w-3" strokeWidth={2.5} />
                                }
                                <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} disabled={uploading} />
                            </label>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-lg text-foreground tracking-tight truncate">{userName}</p>
                            <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                        </div>
                        <div className="shrink-0">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <Zap className="w-3 h-3" />
                                TEKH+
                            </span>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mt-5">
                        {passionBio?.trim() && !editingBio ? (
                            <div
                                className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-muted/40 border border-border/40 cursor-pointer hover:bg-muted/60 transition-colors"
                                onClick={() => setEditingBio(true)}
                            >
                                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-foreground font-medium flex-1 leading-snug">{passionBio}</p>
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider shrink-0">Modifier</span>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Votre passion TEKH
                                </Label>
                                <textarea
                                    value={passionBio}
                                    onChange={(e) => setPassionBio(e.target.value)}
                                    placeholder="Passionné de tech, amateur d'iPhone..."
                                    className="w-full min-h-[80px] rounded-2xl bg-muted/40 border border-border/40 px-4 py-3 text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                />
                                <div className="flex gap-2">
                                    {editingBio && (
                                        <button
                                            onClick={() => { setEditingBio(false); setPassionBio((user as any)?.user_metadata?.bio ?? ""); }}
                                            className="flex-1 h-10 rounded-xl border border-border/50 text-muted-foreground text-sm font-semibold hover:bg-muted/40 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    )}
                                    <Button
                                        onClick={savePassionBio}
                                        disabled={savingBio}
                                        className="flex-1 h-10 rounded-xl bg-foreground text-background hover:opacity-90 font-bold text-sm border-0"
                                    >
                                        {savingBio ? "Enregistrement…" : "Enregistrer"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Sections navigation ── */}
                <div className="space-y-6 px-5">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1 mb-2">
                                {section.title}
                            </p>
                            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center">
                                                <item.icon className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[15px] text-foreground">{item.label}</p>
                                                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* ── Système ── */}
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1 mb-2">
                            {t('settings.system', 'Système')}
                        </p>
                        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden divide-y divide-border/30">

                            {/* Thème */}
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center">
                                        <Sun className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                                    </div>
                                    <p className="font-semibold text-[15px] text-foreground">{t('settings.theme', 'Apparence')}</p>
                                </div>
                                <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/60 border border-border/30">
                                    {themeOptions.map(({ value, icon: Icon, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => setTheme(value as any)}
                                            title={label}
                                            className={`w-8 h-7 rounded-lg flex items-center justify-center transition-all ${theme === value
                                                    ? "bg-background text-foreground shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                                }`}
                                        >
                                            <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Langue */}
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                                    </div>
                                    <p className="font-semibold text-[15px] text-foreground">{t('settings.language', 'Langue')}</p>
                                </div>
                                <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/60 border border-border/30">
                                    {["fr", "en"].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => changeLanguage(l)}
                                            className={`px-3 h-7 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${lang === l
                                                    ? "bg-background text-foreground shadow-sm"
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
                                        <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center">
                                            <Bell className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[15px] text-foreground">Notifications</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {pushGranted ? "Activées" : "Désactivées"}
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
                                            else toast.success("Notifications activées !");
                                            setPushLoading(false);
                                        }}
                                        className={`rounded-xl h-8 px-4 text-xs font-bold border-0 ${pushGranted
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default pointer-events-none"
                                                : "bg-foreground text-background hover:opacity-90"
                                            }`}
                                    >
                                        {pushLoading ? "…" : pushGranted ? "Activé" : "Activer"}
                                    </Button>
                                </div>
                            )}

                            {/* Sécurité — à venir */}
                            <div className="flex items-center justify-between px-4 py-3.5 opacity-40 pointer-events-none select-none">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[15px] text-foreground">Sécurité</p>
                                        <p className="text-[11px] text-muted-foreground">Mot de passe & 2FA</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Bientôt</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Déconnexion ── */}
                    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                        <button
                            type="button"
                            onClick={() => signOut().then(() => navigate("/login"))}
                            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-rose-500/5 active:bg-rose-500/10 transition-colors group"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                    <LogOut className="w-4 h-4 text-rose-500" strokeWidth={1.8} />
                                </div>
                                <p className="font-semibold text-[15px] text-rose-500">{t('profile.logout', 'Déconnexion')}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-rose-500/30 group-hover:text-rose-500/60 transition-colors" />
                        </button>
                    </div>

                    {/* Version */}
                    <div className="flex items-center justify-center gap-1.5 py-4">
                        <Shield className="w-3 h-3 text-muted-foreground/20" />
                        <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.25em]">
                            TΞKΗ+ v3.0.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
