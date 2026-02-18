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
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const [lang, setLang] = useState("fr");
    const [isPWA, setIsPWA] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsPWA(true);
        }
    }, []);

    const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            // Simuler un upload
            setTimeout(() => {
                setUploading(false);
                alert("Photo de profil mise à jour (Simulation)");
            }, 1000);
        }
    };

    const sections = [
        {
            title: "Naviguer",
            items: [
                { icon: List, label: "Historique des échanges", desc: "Consulter vos transactions passées", color: "bg-black dark:bg-white text-white dark:text-black" },
                { icon: Package, label: "Suivre mes commandes", desc: "Voir l'état de vos achats en cours", color: "bg-black dark:bg-white text-white dark:text-black" },
                { icon: CreditCard, label: "Moyens de paiement", desc: "Gérer vos cartes et comptes", color: "bg-black dark:bg-white text-white dark:text-black" },
                { icon: MapPin, label: "Adresses de livraison", desc: "Gérer vos lieux de réception", color: "bg-black dark:bg-white text-white dark:text-black" },
            ]
        },
        {
            title: "Préférences",
            items: [
                { icon: Bell, label: "Notifications", desc: "Paramétrer vos alertes", color: "bg-black dark:bg-white text-white dark:text-black" },
                { icon: LifeBuoy, label: "Aide & Support", desc: "Contacter l'assistance", color: "bg-black dark:bg-white text-white dark:text-black" },
            ]
        }
    ];

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
                        <div className="bg-slate-50 dark:bg-zinc-900 rounded-[32px] overflow-hidden border-2 border-black dark:border-white divide-y-2 divide-black dark:divide-white shadow-xl">
                            {section.items.map((item) => (
                                <button key={item.label} className="w-full flex items-center justify-between p-6 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
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
                    <div className="bg-slate-50 dark:bg-zinc-900 rounded-[32px] overflow-hidden border-2 border-black dark:border-white divide-y-2 divide-black dark:divide-white shadow-xl">
                        <div className="flex items-center justify-between p-6 group hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
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

                        <div className="flex items-center justify-between p-5 group hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-black dark:text-white text-base">Langue</p>
                                    <p className="text-xs text-slate-500 font-bold">Français, Anglais</p>
                                </div>
                            </div>
                            <select
                                value={lang}
                                onChange={(e) => setLang(e.target.value)}
                                className="bg-transparent font-black text-black dark:text-white text-sm focus:outline-none cursor-pointer"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center justify-between p-5 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                    <LogOut className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-rose-500 text-base">Déconnexion</p>
                                    <p className="text-xs text-rose-400 font-bold">Quitter votre session</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-rose-200 group-hover:text-rose-500 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* App Version */}
                <div className="pb-12">
                    <p className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em]">
                        TΞKΗ+ Version 2.2.0 • PWA: {isPWA ? "STANDALONE" : "WEB"}
                    </p>
                </div>

            </div>
        </div>
    );
}
