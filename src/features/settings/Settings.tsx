import { useState, useEffect } from "react";
import {
    User,
    Settings as SettingsIcon,
    Globe,
    Moon,
    Sun,
    Smartphone,
    ShieldCheck,
    LogOut,
    ChevronRight,
    Camera,
    CheckCircle2,
    List,
    Package,
    CreditCard,
    MapPin,
    Bell,
    LifeBuoy
} from "lucide-react";
import { useAuth } from "@/features/auth/auth.context";
import { useTheme } from "@/core/theme/ThemeProvider";
import UserAvatar from "@/shared/components/UserAvatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useTranslation } from "react-i18next";
import i18n from "@/core/config/i18n";

export default function SettingsPage() {
    const { t } = useTranslation();
    const { user, signOut, refreshUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const [lang, setLang] = useState(i18n.language || "fr");
    const [isPWA, setIsPWA] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsPWA(true);
        }
    }, []);

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

    const sections = [
        {
            title: t('settings.navigate', 'Naviguer'),
            items: [
                { icon: List, label: t('settings.history', 'Historique'), desc: t('settings.history_desc', 'Transactions passées'), color: "bg-black dark:bg-white text-white dark:text-black" },
                { icon: Package, label: t('settings.orders', 'Commandes'), desc: t('settings.orders_desc', 'Achats en cours'), color: "bg-black dark:bg-white text-white dark:text-black" },
                { icon: CreditCard, label: t('settings.payment', 'Paiement'), desc: t('settings.payment_desc', 'Cartes & comptes'), color: "bg-black dark:bg-white text-white dark:text-black" },
                { icon: MapPin, label: t('settings.addresses', 'Adresses'), desc: t('settings.addresses_desc', 'Lieux de réception'), color: "bg-black dark:bg-white text-white dark:text-black" },
            ]
        },
        {
            title: t('settings.preferences', 'Préférences'),
            items: [
                { icon: Bell, label: t('settings.alerts', 'Alertes'), desc: t('settings.alerts_desc', 'Notifications'), color: "bg-black dark:bg-white text-white dark:text-black" },
                { icon: LifeBuoy, label: t('settings.support', 'Support'), desc: t('settings.support_desc', 'Aide & assistance'), color: "bg-black dark:bg-white text-white dark:text-black" },
            ]
        }
    ];

    const changeLanguage = (newLang: string) => {
        setLang(newLang);
        i18n.changeLanguage(newLang);
    };

    /* ─────────────────────────────────────────────
       PWA LAYOUT — cards minimales style Spotify
    ───────────────────────────────────────────── */
    if (isPWA) {
        return (
            <div className="min-h-screen bg-background pb-32 pt-safe transition-colors">
                <div className="max-w-xl mx-auto space-y-8 text-foreground">

                    {/* Header - Pure & Centered */}
                    <div className="pt-8 pb-4 px-5 text-center">
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                            Mon <span className="text-primary">Compte</span>
                        </h1>
                    </div>

                    {/* Profile Section - List Style */}
                    <section className="space-y-1">
                        <div className="flex items-center gap-4 px-5 py-6 bg-muted/30 border-y border-border/10 active:bg-muted/50 transition-colors">
                            <div className="relative shrink-0">
                                <UserAvatar user={user} size="xl" className="h-[72px] w-[72px] rounded-full border border-border/10" />
                                <label className="absolute -bottom-1 -right-1 bg-primary text-black p-1.5 rounded-full shadow-lg cursor-pointer active:scale-90 transition-all">
                                    <Camera className="h-4 w-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} disabled={uploading} />
                                </label>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xl font-black truncate tracking-tight">
                                    {(user as any)?.user_metadata?.full_name || "Utilisateur TEKH+"}
                                </p>
                                <p className="text-sm text-muted-foreground truncate font-medium">{(user as any)?.email}</p>
                            </div>
                        </div>
                    </section>

                    {/* Dynamic Sections - Grouped Lists */}
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground px-5 mb-2">{section.title}</h3>
                            <div className="bg-muted/30 border-y border-border/10 divide-y divide-border/10">
                                {section.items.map((item) => (
                                    <button
                                        key={item.label}
                                        className="w-full flex items-center justify-between h-[58px] px-5 active:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background border border-border/10">
                                                <item.icon className="h-4 w-4 text-foreground" strokeWidth={2} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[15px] tracking-tight">{item.label}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* System Section - List Style */}
                    <div className="space-y-1">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground px-5 mb-2">{t('settings.system', 'Système')}</h3>
                        <div className="bg-muted/30 border-y border-border/10 divide-y divide-border/10">
                            {/* Apparence */}
                            <div className="flex items-center justify-between h-[58px] px-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background border border-border/10">
                                        <Sun className="h-4 w-4 text-foreground" strokeWidth={2} />
                                    </div>
                                    <p className="font-semibold text-[15px] tracking-tight">{t('settings.theme', 'Thème')}</p>
                                </div>
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value as any)}
                                    className="bg-transparent font-black text-primary text-[12px] uppercase tracking-wider focus:outline-none cursor-pointer text-right appearance-none px-2"
                                >
                                    <option value="light" className="bg-background text-foreground">Clair</option>
                                    <option value="dark" className="bg-background text-foreground">Sombre</option>
                                    <option value="system" className="bg-background text-foreground">Système</option>
                                </select>
                            </div>

                            {/* Langue */}
                            <div className="flex items-center justify-between h-[58px] px-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-background border border-border/10">
                                        <Globe className="h-4 w-4 text-foreground" strokeWidth={2} />
                                    </div>
                                    <p className="font-semibold text-[15px] tracking-tight">{t('settings.language', 'Langue')}</p>
                                </div>
                                <select
                                    value={lang}
                                    onChange={(e) => changeLanguage(e.target.value)}
                                    className="bg-transparent font-black text-primary text-[12px] uppercase tracking-wider focus:outline-none cursor-pointer text-right appearance-none px-2"
                                >
                                    <option value="fr" className="bg-background text-foreground">FR</option>
                                    <option value="en" className="bg-background text-foreground">EN</option>
                                </select>
                            </div>

                            {/* Logout - Full List Row */}
                            <button
                                onClick={() => signOut()}
                                className="w-full h-[58px] px-5 flex items-center gap-4 active:bg-rose-500/10 transition-colors"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500 shadow-lg shadow-rose-500/20">
                                    <LogOut className="h-4 w-4 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="font-bold text-rose-500 text-[15px] tracking-tight">{t('profile.logout', 'Déconnexion')}</p>
                                    <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest">{t('settings.logout_desc', 'Quitter votre session')}</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Version */}
                    <p className="text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] py-8">
                        TΞKΗ+ v3.0.0 • NATIVE PWA
                    </p>
                </div>
            </div>
        );
    }

    /* ─────────────────────────────────────────────
       WEB LAYOUT — design original inchangé
    ───────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-white dark:bg-black pb-32 pt-safe transition-colors">
            <div className="max-w-xl mx-auto px-4 pt-8 space-y-8">

                {/* Profile Title */}
                <div className="px-4">
                    <h1 className="text-3xl font-black text-black dark:text-white">Paramètres</h1>
                    <p className="text-slate-500 font-bold">Gérez votre compte et vos préférences</p>
                </div>

                {/* Profile Card */}
                <section className="bg-slate-50 dark:bg-zinc-900 rounded-[32px] p-6 border-2 border-black dark:border-white shadow-xl">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <UserAvatar user={user} size="xl" className="h-24 w-24 ring-4 ring-white dark:ring-black shadow-2xl" />
                            <label className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                <Camera className="h-5 w-5" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} disabled={uploading} />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-black dark:text-white">
                                {(user as any)?.user_metadata?.full_name || "Utilisateur TEKH+"}
                            </h2>
                            <p className="text-slate-500 font-bold text-sm">{(user as any)?.email}</p>
                        </div>
                    </div>
                </section>

                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-4">Informations personnelles</h3>
                    <div className="bg-slate-50 dark:bg-zinc-900 rounded-[32px] overflow-hidden border-2 border-black dark:border-white">
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Bio / Description</Label>
                                <Input
                                    placeholder="Décrivez votre passion tech..."
                                    className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl h-14 font-black focus:ring-0 text-black dark:text-white"
                                />
                            </div>
                            <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 rounded-2xl h-14 font-black shadow-xl transition-all border-0">
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Navigation Sections */}
                {sections.map((section) => (
                    <div key={section.title} className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-4">{section.title}</h3>
                        <div className="grid gap-4">
                            {section.items.map((item) => (
                                <button key={item.label} className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-900 rounded-[28px] border-2 border-black dark:border-white hover:scale-[1.02] active:scale-95 transition-all group shadow-lg">
                                    <div className="flex items-center gap-5">
                                        <div className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center shadow-lg`}>
                                            <item.icon className="h-7 w-7" strokeWidth={2.5} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-black dark:text-white text-lg">{item.label}</p>
                                            <p className="text-xs text-slate-500 font-bold">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-black dark:text-white group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* App Settings */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-4">Système</h3>
                    <div className="grid gap-4">
                        {/* Apparence */}
                        <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-900 rounded-[28px] border-2 border-black dark:border-white shadow-lg">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
                                    <Sun className="h-7 w-7" strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-black dark:text-white text-lg">Apparence</p>
                                    <p className="text-xs text-slate-500 font-bold">Thème clair ou sombre</p>
                                </div>
                            </div>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as any)}
                                className="bg-transparent font-black text-black dark:text-white text-base focus:outline-none cursor-pointer border-2 border-black dark:border-white rounded-xl px-4 py-2"
                            >
                                <option value="light">Clair</option>
                                <option value="dark">Sombre</option>
                                <option value="system">Système</option>
                            </select>
                        </div>

                        {/* Langue */}
                        <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-900 rounded-[28px] border-2 border-black dark:border-white shadow-lg">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-lg">
                                    <Globe className="h-7 w-7" strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-black dark:text-white text-lg">Langue</p>
                                    <p className="text-xs text-slate-500 font-bold">Français, Anglais</p>
                                </div>
                            </div>
                            <select
                                value={lang}
                                onChange={(e) => changeLanguage(e.target.value)}
                                className="bg-transparent font-black text-black dark:text-white text-base focus:outline-none cursor-pointer"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        {/* Déconnexion */}
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-900 rounded-[28px] border-2 border-black dark:border-white hover:scale-[1.02] active:scale-95 transition-all group shadow-lg"
                        >
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-lg">
                                    <LogOut className="h-7 w-7" strokeWidth={2.5} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-rose-500 text-lg">Déconnexion</p>
                                    <p className="text-xs text-rose-400 font-bold">Quitter votre session</p>
                                </div>
                            </div>
                            <ChevronRight className="h-6 w-6 text-rose-200 group-hover:text-rose-500 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* App Version */}
                <div className="pb-12">
                    <p className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">
                        TΞKΗ+ Version 2.2.0 • WEB
                    </p>
                </div>

            </div>
        </div>
    );
}
