import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useDeals } from "@/context/DealsContext";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, uploadAvatar, upsertProfile, supabase, ensureProfileForUser, countDealsByOwner } from "@/lib/supabaseApi";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import UserAvatar from "@/components/UserAvatar";
import { LogOut, Camera, Package, ShieldCheck, Heart, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import MotionRings from "@/components/MotionRings";

export default function Profile() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { deals } = useDeals();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dbCount, setDbCount] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const meta = (user as any)?.user_metadata || {};
      setEmail(user?.email || "");
      setName(meta.full_name || meta.name || "");
      const pic = meta.avatar_url || meta.picture || null;
      if (pic) setAvatar(pic);

      if (isSupabaseConfigured && user?.id) {
        ensureProfileForUser(user).catch(() => { });
        countDealsByOwner(user.id).then(setDbCount).catch(() => { });
      }
    }
  }, [user]);

  const myCount = useMemo(() => {
    const uid = user?.id;
    if (!uid) return 0;
    return deals.filter((d) => d.ownerId === uid).length;
  }, [deals, user]);

  const pickAvatar = () => fileRef.current?.click();

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !user?.id) return;
    setSaving(true);
    try {
      const publicUrl = await uploadAvatar(f);
      setAvatar(publicUrl);
      await upsertProfile({ id: user.id, avatar_url: publicUrl });
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } } as any);
      await refreshUser();
      toast({ title: "Photo mise à jour", description: "Votre nouvelle photo de profil est en ligne." });
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur", description: "Impossible de mettre à jour la photo.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await upsertProfile({ id: user.id, full_name: name, avatar_url: avatar || undefined });
      await supabase.auth.updateUser({ data: { full_name: name } } as any);
      toast({ title: "Profil enregistré", description: "Vos informations ont été mises à jour." });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le profil.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch { }
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background pb-32 pt-8 overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">

        {/* Profile Header Card */}
        <section className="relative overflow-hidden bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative group">
              <MotionRings className="scale-75 md:scale-100">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-background shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 relative z-20 bg-card">
                  <UserAvatar user={user} src={avatar || undefined} size="xl" className="h-full w-full object-cover" />
                </div>
              </MotionRings>
              <button
                onClick={pickAvatar}
                disabled={saving}
                className="absolute bottom-4 right-4 h-10 w-10 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-xl flex items-center justify-center border-4 border-background hover:scale-110 active:scale-90 transition-all cursor-pointer z-30"
              >
                <Camera className="h-5 w-5" />
              </button>
              <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleAvatar} />
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-none">
                  {name || t('profile.title')}
                </h1>
                <p className="text-lg font-bold text-muted-foreground">{email}</p>
              </div>

              {/* Google Link Button (Spotify Style) */}
              <div className="flex justify-center md:justify-start">
                <button className="flex items-center gap-3 bg-black hover:bg-zinc-900 transition-all duration-300 p-1.5 pr-6 rounded-full border border-white/5 hover:scale-105 active:scale-95 group shadow-lg">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-white font-sans">{t('profile.linkedAccount')}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <div className="px-4 py-2 bg-background border border-border/40 rounded-full flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider">{dbCount ?? myCount} {t('profile.annonces')}</span>
                </div>
                <div className="px-4 py-2 bg-background border border-border/40 rounded-full flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-blue-500">{t('profile.verified')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats & Shortlinks */}
          <div className="md:col-span-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-card border border-border/60 rounded-2xl text-center space-y-1 shadow-sm">
                <Heart className="h-6 w-6 mx-auto text-rose-500 fill-rose-500/10" />
                <div className="text-2xl font-black">12</div>
                <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('profile.favorites')}</div>
              </div>
              <div className="p-6 bg-card border border-border/60 rounded-2xl text-center space-y-1 shadow-sm">
                <Settings className="h-6 w-6 mx-auto text-slate-400" />
                <div className="text-2xl font-black">{dbCount ?? myCount}</div>
                <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t('profile.active')}</div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => window.location.href = "/settings"}
              className="w-full h-16 rounded-[1.5rem] font-black border-2 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
            >
              Gérer les paramètres
            </Button>

            <Button
              variant="ghost"
              onClick={logout}
              className="w-full h-16 rounded-[1.5rem] font-black text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Se déconnecter
            </Button>
          </div>

          {/* Edit Profile Form */}
          <Card className="md:col-span-2 bg-card border-border/60 rounded-[2.5rem] overflow-hidden shadow-lg">
            <CardContent className="p-8 md:p-10 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                  <span className="h-8 w-1 bg-primary rounded-full" />
                  Informations du compte
                </h3>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nom complet affiché</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className="h-14 rounded-2xl border-2 border-border/40 bg-background font-black text-lg focus-visible:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Adresse email (non modifiable)</Label>
                    <Input
                      value={email}
                      readOnly
                      className="h-14 rounded-2xl bg-muted/50 border-0 font-bold text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <Button
                  onClick={saveProfile}
                  disabled={saving}
                  className="w-full h-16 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/10 active:scale-95 transition-all"
                >
                  {saving ? "Enregistrement..." : "Mettre à jour mon profil"}
                </Button>
                <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Vos informations sont privées et sécurisées par TEKH+. <br />
                  Seul votre nom est visible lors de vos deals.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
