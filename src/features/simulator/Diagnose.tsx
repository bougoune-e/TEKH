import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Progress } from "@/shared/ui/progress";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Check, Smartphone, TouchpadOff, Camera, RefreshCw } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Badge } from "@/shared/ui/badge";

export default function DiagnosePage() {
    const [step, setStep] = useState(1);
    const [touchGrid, setTouchGrid] = useState<boolean[]>(new Array(20).fill(false));
    const [cameraPermission, setCameraPermission] = useState(false);
    const [diagnostics, setDiagnostics] = useState({
        ram: "8 Go (Détecté)",
        storage: "256 Go (Détecté)",
        screen: "Test en attente",
        camera: "Non testé"
    });
    const { toast } = useToast();

    const handleTouchStart = (index: number) => {
        const newGrid = [...touchGrid];
        newGrid[index] = true;
        setTouchGrid(newGrid);
    };

    const progress = (touchGrid.filter(Boolean).length / touchGrid.length) * 100;

    return (
        <section className="py-10 bg-background min-h-screen">
            <div className="container mx-auto px-4 max-w-2xl">
                <header className="mb-8 text-center">
                    <Badge variant="outline" className="mb-2 border-primary text-primary">Beta - MVP</Badge>
                    <h1 className="text-3xl font-bold tracking-tight">Diagnostic Automatisé</h1>
                    <p className="text-muted-foreground mt-2">Validez l'état de votre téléphone pour obtenir un certificat de confiance temporaire.</p>
                </header>

                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Étape 1 : Vérification Système</CardTitle>
                            <CardDescription>Nous analysons les spécifications techniques de votre appareil.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3">
                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                    <span className="font-medium flex items-center gap-2"><Smartphone className="h-4 w-4" /> Modèle détecté</span>
                                    <span className="text-emerald-600 font-bold">iPhone 13</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                    <span className="font-medium">RAM</span>
                                    <span>{diagnostics.ram}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                    <span className="font-medium">Stockage</span>
                                    <span>{diagnostics.storage}</span>
                                </div>
                            </div>
                            <Button className="w-full" onClick={() => setStep(2)}>Continuer vers le test écran</Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Étape 2 : Test Tactile</CardTitle>
                            <CardDescription>Passez votre doigt sur toutes les zones de la grille ci-dessous pour valider l'écran.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-5 gap-1 aspect-[4/5] bg-muted relative rounded-lg overflow-hidden touch-none select-none">
                                {touchGrid.map((touched, i) => (
                                    <div
                                        key={i}
                                        className={`transition-colors duration-200 border border-white/10 ${touched ? 'bg-emerald-500' : 'bg-card'}`}
                                        onMouseEnter={() => handleTouchStart(i)}
                                        onTouchMove={() => handleTouchStart(i)} // Simplification for MVP
                                    />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progression</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            {progress === 100 ? (
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                                    setDiagnostics(d => ({ ...d, screen: "Fonctionnel" }));
                                    setStep(3);
                                }}>
                                    Test réussi - Continuer
                                </Button>
                            ) : (
                                <div className="text-center text-xs text-muted-foreground">Complétez la grille pour continuer</div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Étape 3 : Photo de validation</CardTitle>
                            <CardDescription>Prenez une photo de votre téléphone devant un miroir pour valider l'état physique.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 text-center">
                            <div className="w-full h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/20">
                                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                                <Button variant="secondary">Ouvrir la caméra (Simulé)</Button>
                                <p className="text-xs text-muted-foreground mt-2">Fonctionnalité native disponible sur App Mobile</p>
                            </div>
                            <Button className="w-full" onClick={() => {
                                toast({ title: "Diagnostic Terminé", description: "Score de confiance généré : 92/100" });
                                // Navigate to result or back to home
                            }}>
                                Terminer et Générer le Certificat
                            </Button>
                        </CardContent>
                    </Card>
                )}

            </div>
        </section>
    );
}
