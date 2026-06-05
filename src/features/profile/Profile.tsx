import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/core/api/utils";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { useTranslation } from "react-i18next";
import { useDeals } from "@/features/marketplace/deals.context";
import { useAuth } from "@/features/auth/auth.context";
import { uploadAvatar, upsertProfile, supabase, ensureProfileForUser, countDealsByOwner, fetchTekhPointsSummary, TekhPointsSummary } from "@/core/api/supabaseApi";
import { getUserImpactStats, getUserReferralCode } from "@/core/api/referral";
import { isSupabaseConfigured } from "@/core/api/supabaseClient";
import UserAvatar from "@/shared/components/UserAvatar";
import { LogOut, Camera, Package, ShieldCheck, ShoppingCart, ChevronRight, Coins, Clock, Info, TreePine, Share2, Copy, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import MotionRings from "@/shared/components/MotionRings";
import { useCart } from "@/features/marketplace/cart.context";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/shared/ui/dialog";
import { generateSecureTransactionQR } from "@/core/utils/qr";
import { QrCode, Timer, Gift, Headphones } from "lucide-react";

export default function Profile() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();

  const { deals } = useDeals();
  const { items: cartItems } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [tekhPoints, setTekhPoints] = useState<TekhPointsSummary | null>(null);
  const [tekhSheet, setTekhSheet] = useState(false);
  const [impactStats, setImpactStats] = useState<any>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

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
        fetchTekhPointsSummary(user.id)
          .then(setTekhPoints)
          .catch(() => setTekhPoints({ balanceFcfa: 0, points: 0, nextExpiry: null, activeLines: 0, lines: [] }));

        getUserImpactStats(user.id).then(setImpactStats);
        getUserReferralCode(user.id).then(setReferralCode);
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
    try {
      localStorage.removeItem("tekh:nav-snapshot");
      await supabase.auth.signOut();
    } catch { }
    window.location.href = "/login";
  };

  const handleShare = () => {
    if (!referralCode) return;
    const url = `${window.location.origin}/invite?ref=${referralCode}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Lien copié !",
        description: "Partagez ce lien pour parrainer vos proches.",
      });
    });
  };

  return (
    <div className="min-h-dvh bg-background pb-32 pt-8 overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">

        {/* Profile Header Card */}
        <section className="relative overflow-hidden bg-card border border-border/60 rounded-[2.5rem] p-8 md:p-12 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative flex items-center justify-center">
              <MotionRings className="scale-75 md:scale-100">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-2xl relative z-20 bg-card aspect-square shrink-0">
                  <UserAvatar user={user} src={avatar || undefined} size="xl" className="!h-full !w-full" />
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
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-blue-500">{t('profile.verified')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TekhPoints */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">TekhPoints</h2>
          <button
            type="button"
            onClick={() => setTekhSheet(true)}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-br from-[#064e3b]/10 to-[#059669]/5 dark:from-[#059669]/20 dark:to-transparent border border-[#064e3b]/20 dark:border-[#059669]/30 rounded-2xl hover:shadow-md transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#064e3b]/15 dark:bg-[#059669]/25 flex items-center justify-center shrink-0">
                <Coins className="h-6 w-6 text-[#064e3b] dark:text-[#34d399]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Solde TekhPoints</p>
                <p className="text-2xl font-black text-[#064e3b] dark:text-[#34d399] leading-tight">
                  {tekhPoints?.points ?? 0}
                  <span className="text-sm font-bold text-muted-foreground ml-1.5">pts</span>
                </p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  {(tekhPoints?.balanceFcfa ?? 0) > 0
                    ? `≈ ${(tekhPoints!.balanceFcfa).toLocaleString("fr-FR")} FCFA`
                    : "Aucun crédit actif"}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#064e3b] shrink-0 transition-colors" />
          </button>
        </section>

        {/* Mon Impact ESG & Club TEKH+ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Club TEKH+ & Impact</h2>
            {impactStats?.co2Saved > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase italic">
                <TrendingUp className="h-3 w-3" /> Score Éco en hausse
              </span>
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-[2rem] overflow-hidden relative shadow-lg">
            {/* Background Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

            <div className="p-6 sm:p-8 space-y-8 relative">
              {/* Header Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <TreePine className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground leading-tight">
                      {impactStats?.co2Saved?.toFixed(1) ?? "0.0"}
                      <span className="text-sm font-bold text-muted-foreground ml-1.5 uppercase tracking-tighter">kg CO₂</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Impact Écologique</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-background border border-border/60 rounded-2xl p-3 px-4 flex flex-col items-center justify-center min-w-[100px]">
                    <p className="text-xl font-black text-foreground leading-none">{impactStats?.convertedCount ?? 0}</p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter mt-1">Filleuls</p>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground">Objectif Cadeau Club</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{impactStats?.convertedCount ?? 0} / 5</span>
                </div>
                <div className="h-3.5 bg-muted/30 rounded-full overflow-hidden border border-border/10 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    style={{ width: `${Math.min(100, ((impactStats?.convertedCount ?? 0) / 5) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold italic leading-tight">
                  {impactStats?.remainingToGoal > 0
                    ? `Plus que ${impactStats.remainingToGoal} parrainage${impactStats.remainingToGoal > 1 ? 's' : ''} pour débloquer vos TEKH Pods (Écouteurs Sans Fil).`
                    : "🎉 Objectif atteint ! Vous pouvez maintenant réclamer vos TEKH Pods en agence."}
                </p>
              </div>

              {/* Reward Item Card */}
              <div className={cn(
                "p-4 rounded-3xl border-2 transition-all duration-500 flex items-center justify-between gap-4",
                impactStats?.rewardStatus === 'eligible_reward'
                  ? "bg-amber-500/5 border-amber-500/20 shadow-xl shadow-amber-500/5 scale-105"
                  : "bg-muted/10 border-border/40 opacity-60 grayscale"
              )}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center shadow-md">
                    <Headphones className={cn("h-6 w-6", impactStats?.rewardStatus === 'eligible_reward' ? "text-amber-600" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight">TEKH Pods Series 1</h4>
                    <p className="text-[10px] text-muted-foreground font-bold">Réduction de bruit & Basses profondes</p>
                  </div>
                </div>

                {impactStats?.rewardStatus === 'eligible_reward' ? (
                  <Dialog onOpenChange={(open) => {
                    if (open) {
                      setTimeout(() => {
                        if (user) {
                          generateSecureTransactionQR('REWARD_EARPHONES', user.id, 'reward-qr-canvas');
                        }
                      }, 100);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest px-4 h-9 shadow-lg shadow-amber-600/20 active:scale-95 transition-transform"
                      >
                        Réclamer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8">
                      <DialogHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center mb-4">
                          <Gift className="h-8 w-8 text-amber-600" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-amber-600">Félicitations !</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-muted-foreground pt-2">
                          Présentez ce QR Code en agence physique TEKH+ pour retirer vos TEKH Pods.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center space-y-6 py-6 font-sans">
                        <div className="bg-white p-4 rounded-3xl shadow-inner border-2 border-dashed border-amber-200">
                          <canvas id="reward-qr-canvas" className="w-[200px] h-[200px]" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 animate-pulse flex items-center gap-2 justify-center">
                            <Timer className="h-3 w-3" /> Code Sécurisé Actif
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium italic">
                            Valide pendant 5 minutes.
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full rounded-2xl bg-amber-600 hover:bg-amber-700 font-black uppercase tracking-[0.2em] text-[10px] h-12"
                        onClick={() => {
                          if (user) {
                            generateSecureTransactionQR('REWARD_EARPHONES', user.id, 'reward-qr-canvas');
                          }
                        }}
                      >
                        Actualiser le code
                      </Button>
                    </DialogContent>
                  </Dialog>
                ) : impactStats?.rewardStatus === 'reward_claimed' ? (
                  <div className="px-4 py-2 bg-blue-500/10 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-blue-600" />
                    <span className="text-[10px] font-black text-blue-600 uppercase">Récupéré</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-muted/40 rounded-xl">
                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">Bloqué</span>
                  </div>
                )}
              </div>

              {/* Share Action */}
              <div className="pt-2">
                <button
                  onClick={handleShare}
                  className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl group border border-white/10"
                >
                  <Share2 className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  Inviter mes contacts
                  <Copy className="h-3.5 w-3.5 opacity-50 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Sheet détail TekhPoints */}
        <Sheet open={tekhSheet} onOpenChange={setTekhSheet}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center gap-2 text-[#064e3b] dark:text-[#34d399]">
                <Coins className="h-5 w-5" /> Mes TekhPoints
              </SheetTitle>
            </SheetHeader>

            {/* Solde total */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#064e3b]/10 to-[#059669]/5 dark:from-[#059669]/15 dark:to-transparent rounded-2xl border border-[#064e3b]/15 dark:border-[#059669]/25 mb-5">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Total disponible</p>
                <p className="text-3xl font-black text-[#064e3b] dark:text-[#34d399] leading-tight">
                  {tekhPoints?.points ?? 0}
                  <span className="text-base font-bold text-muted-foreground ml-2">pts</span>
                </p>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">
                  = {(tekhPoints?.balanceFcfa ?? 0).toLocaleString("fr-FR")} FCFA
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#064e3b]/15 dark:bg-[#059669]/25 flex items-center justify-center">
                <Coins className="h-7 w-7 text-[#064e3b] dark:text-[#34d399]" />
              </div>
            </div>

            {/* Lignes de crédit */}
            {(tekhPoints?.lines?.length ?? 0) > 0 ? (
              <div className="space-y-2 mb-5">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 mb-2">Détail des crédits actifs</p>
                {tekhPoints!.lines.map((line) => {
                  const pts = Math.floor(line.amount_fcfa / 500);
                  const expiry = new Date(line.expires_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
                  const daysLeft = Math.ceil((new Date(line.expires_at).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={line.id} className="flex items-center justify-between p-3.5 bg-card border border-border/50 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{line.motif}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          Expire le {expiry}
                          {daysLeft <= 14 && (
                            <span className="ml-1 text-amber-500 font-bold">({daysLeft}j restants)</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-base font-black text-[#064e3b] dark:text-[#34d399]">{pts} pts</p>
                        <p className="text-[10px] text-muted-foreground">{line.amount_fcfa.toLocaleString("fr-FR")} FCFA</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2 mb-4">
                <Coins className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm font-semibold text-muted-foreground">Aucun crédit actif</p>
                <p className="text-xs text-muted-foreground/70">Les points sont crédités après une transaction validée.</p>
              </div>
            )}

            {/* Lien politique */}
            <Link
              to="/politique-echange-tekhpoints"
              onClick={() => setTekhSheet(false)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
            >
              <Info className="h-3.5 w-3.5 shrink-0" />
              Voir la politique d&apos;échange TekhPoints
            </Link>
          </SheetContent>
        </Sheet>

        {/* Espace personnel : Mon panier */}
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Espace personnel</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/panier"
              className="flex items-center justify-between p-5 bg-card border border-border/60 rounded-2xl hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#064e3b]/10 dark:bg-[#059669]/20 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-[#064e3b] dark:text-[#059669]" />
                </div>
                <div>
                  <p className="font-black text-foreground">Mon panier</p>
                  <p className="text-xs text-muted-foreground font-bold">{cartItems.length} article{cartItems.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#064e3b]" />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shortlinks */}
          <div className="md:col-span-1 space-y-6">
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
                      onBlur={saveProfile}
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

              <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest leading-relaxed pt-2">
                Vos informations sont privées et sécurisées par TEKH+. <br />
                Seul votre nom est visible lors de vos deals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
