import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { captureReferralCode } from "@/core/api/referral";
import { Button } from "@/shared/ui/button";
import { UserPlus, ShieldCheck, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import MotionRings from "@/shared/components/MotionRings";

export default function InvitePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        // 1. Capture le code depuis l'URL
        captureReferralCode();

        // On pourrait aussi rediriger automatiquement après X secondes
        // mais une page de bienvenue est plus accueillante
    }, []);

    return (
        <div className="min-h-dvh bg-background flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-700">
            <div className="relative">
                <MotionRings className="scale-110">
                    <div className="w-24 h-24 rounded-3xl bg-[#00FF41]/10 flex items-center justify-center border-2 border-[#00FF41]/20 shadow-2xl">
                        <Zap className="w-12 h-12 text-[#00FF41]" fill="currentColor" />
                    </div>
                </MotionRings>
            </div>

            <div className="space-y-4 max-w-md">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-[0.9] text-foreground">
                    BIENVENUE CHEZ <span className="text-[#00FF41]">TEKH+</span>
                </h1>
                <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest px-4">
                    Vous avez été invité à rejoindre la première plateforme d'échange tech éco-responsable.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
                <Button
                    onClick={() => navigate("/signup")}
                    className="h-16 rounded-[1.5rem] bg-[#00FF41] hover:bg-[#00FF41]/90 text-black font-black text-lg shadow-xl group"
                >
                    CRÉER MON COMPTE <UserPlus className="ml-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>

                <Button
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="h-16 rounded-[1.5rem] border-2 font-black text-sm uppercase tracking-widest"
                >
                    J'ai déjà un compte
                </Button>
            </div>

            <div className="flex items-center gap-2 pt-8">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                    PROTECTION & CERTIFICATION TEKH+
                </p>
            </div>
        </div>
    );
}
