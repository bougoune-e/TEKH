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
    Bell,
    LifeBuoy,
    Shield,
    UserRound,
    Settings2,
} from "lucide-react";
import { useAuth } from "@/features/auth/auth.context";
import { useTheme } from "@/core/theme/ThemeProvider";
import UserAvatar from "@/shared/components/UserAvatar";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import i18n from "@/core/config/i18n";
type AccountPageProps = { view?: "profile" | "settings" };
import { useNavigate, Link } from "react-router-dom";

export default function AccountPage({ view = "profile" }: AccountPageProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, signOut, refreshUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const [lang, setLang] = useState(i18n.language || "fr");
    const [uploading, setUploading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [profile, setProfile] = useState<{ full_name?: string | null; avatar_url?: string | null } | null>(null);

    useEffect(() => {
        let active = true;
        if (!user?.id) {
            setProfile(null);
            setDisplayName("");
            return () => { active = false; };
        }
        void import("@/core/api/supabaseApi").then(({ getProfileById }) => getProfileById(user.id)).then((data) => {
            if (!active) return;
            setProfile(data);
            setDisplayName(data?.full_name ?? "");
        }).catch(() => {
            if (active) setProfile(null);
        });
        return () => { active = false; };
    }, [user?.id]);

    const saveProfile = async () => {
        if (!user?.id) return;
        setSavingProfile(true);
        try {
            const { updateProfile } = await import("@/core/api/supabaseApi");
            const updated = await updateProfile(user.id, { full_name: displayName.trim() || null });
            setProfile(updated);
            await refreshUser();
            const { toast } = await import("sonner");
            toast.success(t("account.saved"));
        } catch (e: any) {
            const { toast } = await import("sonner");
            toast.error(e?.message || t("account.saveError"));
        } finally {
            setSavingProfile(false);
        }
    };

    const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user?.id) {
            setUploading(true);
            try {
                const { uploadAvatar, updateProfile } = await import("@/core/api/supabaseApi");
                const publicUrl = await uploadAvatar(file, user.id);
                const updated = await updateProfile(user.id, { avatar_url: publicUrl });
                setProfile(updated);
                await refreshUser();
            } catch (err) {
                console.error("Upload failed", err);
                const { toast } = await import("sonner");
                toast.error(t("account.uploadError"));
            } finally {
                setUploading(false);
            }
        }
    };

    const changeLanguage = (newLang: string) => {
        setLang(newLang);
        i18n.changeLanguage(newLang);
    };

    const userName = profile?.full_name || (user as any)?.user_metadata?.full_name || t("account.userFallback");
    const userEmail = (user as any)?.email || "";

    const themeOptions = [
        { value: "light", label: t("settings.light"), icon: Sun },
        { value: "dark", label: t("settings.dark"), icon: Moon },
    ];

    const navSections = [
        {
            title: t("settings.activitiesTitle"),
            items: [
                { icon: List, label: t('settings.history', 'Historique'), desc: t('settings.history_desc', 'Transactions passées'), path: "/historique" },
                { icon: Package, label: t('settings.orders', 'Commandes'), desc: t('settings.orders_desc', 'Achats en cours'), path: "/commandes" },
            ],
        },
        {
            title: t("settings.security"),
            items: [
                { icon: Shield, label: t("settings.security"), desc: t("settings.securityDesc"), path: "/forgot-password" },
            ],
        },
        {
            title: t("settings.assistanceTitle"),
            items: [
                { icon: Bell, label: t('settings.alerts'), desc: t('settings.notificationsDesc'), path: "/notifications" },
                { icon: LifeBuoy, label: t('settings.support'), desc: t('settings.support_desc'), path: "/aide-et-faq" },
            ],
        },
    ];

    return (
        <div className="min-h-dvh bg-background pb-32 pt-safe">
            <div className="max-w-6xl mx-auto px-5 lg:px-8">

                {/* ── Profil ── */}
                <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-8 lg:pt-12">
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 rounded-[1.75rem] border border-border/60 bg-card p-3 shadow-sm">
                            <p className="px-3 pt-2 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("account.personalSpace")}</p>
                            <Link to="/profile" className="flex items-center gap-3 rounded-2xl bg-primary px-3 py-3 text-sm font-bold text-primary-foreground"><UserRound className="h-4 w-4" />{t("account.profile")}</Link>
                            <Link to="/profile#activites" className="mt-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><List className="h-4 w-4" />{t("account.activities")}</Link>
                            <Link to="/settings" className="mt-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Settings2 className="h-4 w-4" />{t("account.preferences")}</Link>
                            <Link to="/aide-et-faq" className="mt-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><LifeBuoy className="h-4 w-4" />{t("account.help")}</Link>
                            <div className="my-3 border-t border-border/60" />
                            <button type="button" onClick={() => signOut().then(() => navigate("/login"))} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors"><LogOut className="h-4 w-4" />{t("account.logout")}</button>
                        </div>
                    </aside>
                    <main className="min-w-0">
                {view === "profile" && (<>
                <div id="profil" className="pt-8 pb-6">
                    <h1 className="text-2xl font-black tracking-tight text-foreground mb-1">{t("account.clientSpace")}</h1>

                    <p className="text-sm text-muted-foreground mb-6">{t("account.profileSubtitle")}</p>
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <UserAvatar user={user} src={profile?.avatar_url ?? undefined} size="xl" className="w-16 h-16 rounded-2xl" />
                            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-foreground text-background flex items-center justify-center rounded-lg shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                {uploading
                                    ? <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent animate-spin rounded-full" />
                                    : <Camera className="h-3 w-3" strokeWidth={2.5} />
                                }
                                <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} disabled={uploading} />
                            </label>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-lg text-foreground tracking-tight truncate">{displayName || userName}</p>
                            <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[1.75rem] border border-border/60 bg-card p-5 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{t("account.personalInfo")}</p>
                        <label className="mt-4 block text-sm font-semibold text-foreground">{t("account.fullName")}</label>
                        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("account.namePlaceholder")} className="mt-2 h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm font-medium outline-none transition focus:ring-2 focus:ring-primary/30" />
                        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/60 pt-4"><div><p className="text-sm font-semibold text-foreground">{t("account.email")}</p><p className="text-sm text-muted-foreground">{userEmail}</p></div><Button onClick={saveProfile} disabled={savingProfile} className="rounded-xl bg-foreground text-background hover:opacity-90">{savingProfile ? "…" : t("account.save")}</Button></div>
                    </div>
                </div>

                {/* ── Sections navigation ── */}
                <section id="activites" className="pb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1 mb-2">{t("account.services")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Link to="/historique" className="rounded-2xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"><p className="font-bold text-foreground">{t("account.estimates")}</p><p className="text-xs text-muted-foreground mt-1">{t("account.estimatesDesc")}</p></Link>
                        <Link to="/maintenance" className="rounded-2xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"><p className="font-bold text-foreground">{t("account.repair")}</p><p className="text-xs text-muted-foreground mt-1">{t("account.repairDesc")}</p></Link>
                        <Link to="/commandes" className="rounded-2xl border border-border/50 bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"><p className="font-bold text-foreground">{t("account.guarantees")}</p><p className="text-xs text-muted-foreground mt-1">{t("account.guaranteesDesc")}</p></Link>
                    </div>
                </section>
                </>)}



                    {view === "settings" && <>
                      <div className="pt-8 pb-2"><h1 className="text-2xl font-black tracking-tight text-foreground">{t("settings.settingsTitle")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("settings.settingsSubtitle")}</p></div>
                      <div id="preferences" className="space-y-6">
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
                    <div id="assistance" className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-1 mb-2">
                            {t("settings.appearance")}
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

                        </div>
                    </div>


                    {/* Version */}
                    <div className="flex items-center justify-center gap-1.5 py-4">
                        <Shield className="w-3 h-3 text-muted-foreground/20" />
                        <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.25em]">
                            TΞKΗ+ v3.0.0
                        </p>
                    </div>
                      </div>
                    </>}
                    </main>
            </div>
                </div>
        </div>
    );
}
