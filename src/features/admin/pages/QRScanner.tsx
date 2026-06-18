import QrScanner from 'qr-scanner';
import { supabase } from "@/core/api/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, Camera, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/shared/hooks/use-toast";
import { cn } from "@/core/api/utils";

export default function QRScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<any>(null);
    const [status, setStatus] = useState<{
        loading: boolean;
        success?: boolean;
        message: string;
    }>({ loading: false, message: "Prêt à scanner" });

    useEffect(() => {
        if (!videoRef.current) return;

        const scanner = new QrScanner(
            videoRef.current,
            async (result: any) => {
                scanner.stop();
                await handleScanResult(result.data);
            },
            {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                returnDetailedScanResult: true
            }
        );

        scanner.start().catch((err: any) => {
            setStatus({ loading: false, success: false, message: `Erreur caméra : ${err.message}` });
        });

        scannerRef.current = scanner;

        return () => {
            scanner.destroy();
        };
    }, []);

    const handleScanResult = async (dataString: string) => {
        setStatus({ loading: true, message: "Analyse du code..." });

        try {
            const data = JSON.parse(dataString);
            const { tId, uId, exp } = data;

            if (!tId || !uId || !exp) {
                throw new Error("QR Code invalide ou corrompu.");
            }

            // Anti-fraud: Expiry check
            if (Date.now() > exp) {
                throw new Error("Code expiré. Demandez au client d'actualiser son écran.");
            }

            setStatus({ loading: true, message: "Validation en base de données..." });

            if (tId.startsWith("REWARD_")) {
                // Scenario: Reward Redemption
                const { error } = await supabase
                    .from('profiles')
                    .update({ reward_status: 'reward_claimed' })
                    .eq('id', uId)
                    .eq('reward_status', 'eligible_reward');

                if (error) throw error;
                setStatus({ success: true, loading: false, message: "CADEAU VALIDÉ ! Vous pouvez remettre l'article au client." });
            } else {
                // Scenario: Device Deposit
                const { error } = await supabase
                    .from('device_transactions')
                    .update({
                        status: 'Déposé',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', tId)
                    .eq('user_id', uId);

                if (error) throw error;
                setStatus({ success: true, loading: false, message: "DÉPÔT VALIDÉ. L'appareil est maintenant enregistré comme déposé." });
            }

            toast({ title: "Scan réussi", description: "La transaction a été mise à jour." });

        } catch (err: any) {
            console.error("Scan error:", err.message);
            setStatus({ success: false, loading: false, message: `Échec : ${err.message}` });
            toast({ title: "Erreur de scan", description: err.message, variant: "destructive" });
        }
    };

    const resumeScanner = () => {
        setStatus({ loading: false, message: "Prêt à scanner" });
        scannerRef.current?.start();
    };

    return (
        <div className="min-h-dvh bg-zinc-950 text-white pb-32">
            <div className="p-4 flex items-center gap-4">
                <Link to="/admin" className="p-2 bg-white/10 rounded-xl">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-xl font-black uppercase tracking-tighter italic">Scanner de Validation</h1>
            </div>

            <div className="px-4 space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden rounded-[2.5rem] relative">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Flux Caméra Direct</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 relative aspect-square sm:aspect-video bg-black flex items-center justify-center">
                        <video ref={videoRef} className="w-full h-full object-cover" />

                        {/* Overlay when loading/success/error */}
                        {(status.loading || status.success !== undefined) && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-4 z-50">
                                {status.loading ? (
                                    <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                                ) : status.success ? (
                                    <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="h-16 w-16 text-rose-500" />
                                )}
                                <p className={cn(
                                    "text-lg font-black uppercase tracking-tight italic",
                                    status.success ? "text-emerald-500" : status.success === false ? "text-rose-500" : "text-white"
                                )}>
                                    {status.message}
                                </p>

                                {!status.loading && (
                                    <Button
                                        onClick={resumeScanner}
                                        className="mt-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl group"
                                    >
                                        Scanner à nouveau
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <Camera className="h-5 w-5 text-emerald-500" />
                        <p className="text-xs font-bold text-emerald-100/80 leading-snug">
                            Ciblez le QR code du client. Assurez-vous d&apos;avoir une bonne luminosité.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Rôle</p>
                            <p className="text-xs font-bold">Agent Agence</p>
                        </div>
                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Mode</p>
                            <p className="text-xs font-bold italic">Multi-Validation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


