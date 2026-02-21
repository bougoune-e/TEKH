import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "@/shared/hooks/use-toast";
import { fetchCatalogItems, insertDealbox, fetchDealboxes } from "@/core/api/supabaseApi";
import { ShieldCheck, StopCircle, Clock, Save, Lock } from "lucide-react";

export default function AdminPage() {
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [catalog, setCatalog] = useState<any[]>([]);
    const [activeDeals, setActiveDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [price, setPrice] = useState("");
    const [hours, setHours] = useState("24");
    const [typeBox, setTypeBox] = useState<"KING" | "QUEEN">("KING");
    const [certifs, setCertifs] = useState({
        data_wipe: true,
        diagnostic_50_pts: true,
        batterie_certifiee: true,
        accessoires_premium: false
    });

    const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

    useEffect(() => {
        const saved = sessionStorage.getItem("tekh_admin_auth");
        if (saved === "true") {
            setIsAuthenticated(true);
            loadData();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASS) {
            setIsAuthenticated(true);
            sessionStorage.setItem("tekh_admin_auth", "true");
            toast({ title: "Accès autorisé", description: "Bienvenue dans le TekH Control Center" });
            loadData();
        } else {
            toast({ title: "Accès refusé", variant: "destructive" });
        }
    };

    const loadData = async () => {
        setLoading(true);
        const [cat, deals] = await Promise.all([fetchCatalogItems(), fetchDealboxes()]);
        setCatalog(cat || []);
        setActiveDeals(deals || []);
        setLoading(false);
    };

    const handleSelect = (item: any) => {
        setSelectedItem(item);
        setPrice(String(Math.round(item.prix * 0.9))); // Default -10%
    };

    const createDealbox = async () => {
        if (!selectedItem || !price) return;

        const expire = new Date();
        expire.setHours(expire.getHours() + Number(hours));

        try {
            await insertDealbox({
                modele: selectedItem.modele,
                stockage: Number(selectedItem.stockage),
                prix_dealbox: Number(price),
                type_box: typeBox,
                certifications: certifs,
                expiration_date: expire.toISOString(),
                status: "available"
            });
            toast({ title: "Dealbox Créée !", className: "bg-green-600 text-white" });
            setSelectedItem(null);
            loadData(); // refresh
        } catch (e) {
            toast({ title: "Erreur", description: String(e), variant: "destructive" });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-center flex flex-col items-center gap-2">
                            <Lock className="h-8 w-8 text-yellow-500" />
                            TEKH ADMIN
                        </CardTitle>
                        <CardDescription className="text-zinc-400 text-center">Accès réservé au personnel certifié</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                type="password"
                                placeholder="Mot de passe confidentiel"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                                Déverrouiller
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-20 p-4 font-sans">
            <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <ShieldCheck className="text-green-500" /> TEKH<span className="text-yellow-500">CONTROL</span>
                </h1>
                <Button variant="ghost" className="text-zinc-400" onClick={() => {
                    setIsAuthenticated(false);
                    sessionStorage.removeItem("tekh_admin_auth");
                }}>Déconnexion</Button>
            </header>

            <main className="max-w-6xl mx-auto space-y-8">
                {/* Stats Fast View */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-medium text-zinc-400">Dealboxes Actives</CardTitle></CardHeader>
                        <CardContent className="p-4 pt-0 text-2xl font-bold">{activeDeals.length}</CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader className="p-4 pb-2"><CardTitle className="text-sm font-medium text-zinc-400">Produits au Catalogue</CardTitle></CardHeader>
                        <CardContent className="p-4 pt-0 text-2xl font-bold">{catalog.length}</CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* CREATION FORM */}
                    <Card className="bg-zinc-900 border-zinc-800 text-white h-fit">
                        <CardHeader>
                            <CardTitle>Générateur de Dealbox</CardTitle>
                            <CardDescription className="text-zinc-400">Sélectionnez un produit du catalogue ci-contre pour commencer.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {selectedItem ? (
                                <>
                                    <div className="p-4 bg-zinc-800 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-lg">{selectedItem.modele}</p>
                                            <p className="text-sm text-zinc-400">{selectedItem.stockage} Go • Ref: {selectedItem.marque}</p>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => setSelectedItem(null)}>Changer</Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type de Box</Label>
                                            <Select value={typeBox} onValueChange={(v: any) => setTypeBox(v)}>
                                                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="KING">KING (Or/Premium)</SelectItem>
                                                    <SelectItem value="QUEEN">QUEEN (Argent/Mystère)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Durée du Deal (h)</Label>
                                            <Input type="number" value={hours} onChange={e => setHours(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Prix Spécial Deal (FCFA)</Label>
                                        <Input
                                            type="number"
                                            value={price}
                                            onChange={e => setPrice(e.target.value)}
                                            className="bg-zinc-800 border-zinc-700 text-xl font-mono text-green-400"
                                        />
                                        <p className="text-xs text-zinc-500">Prix catalogue: {selectedItem.prix}</p>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Label>Certifications TEKH</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(certifs).map(([key, val]) => (
                                                <div key={key} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={key}
                                                        checked={val}
                                                        onCheckedChange={(c) => setCertifs(prev => ({ ...prev, [key]: !!c }))}
                                                        className="border-zinc-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                    />
                                                    <Label htmlFor={key} className="text-sm capitalize cursor-pointer">{key.replace(/_/g, " ")}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={createDealbox} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold h-12 text-lg hover:brightness-110 transition-all">
                                        PUBLIER CE DEAL
                                    </Button>
                                </>
                            ) : (
                                <div className="h-64 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg text-zinc-500">
                                    Selectionnez un produit à droite &rarr;
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* CATALOG LIST */}
                    <Card className="bg-zinc-900 border-zinc-800 text-white flex flex-col max-h-[800px]">
                        <CardHeader>
                            <CardTitle>Catalogue Source</CardTitle>
                            <Input placeholder="Rechercher un modèle..." className="bg-zinc-800 border-zinc-700 mt-2" />
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto pr-1">
                            <div className="space-y-2">
                                {loading ? <p className="text-zinc-500">Chargement...</p> : catalog.slice(0, 50).map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 hover:bg-zinc-800 rounded-lg group transition-colors border border-transparent hover:border-zinc-700">
                                        <div>
                                            <p className="font-semibold text-zinc-200">{item.modele}</p>
                                            <p className="text-xs text-zinc-500">{item.stockage} Go • {item.prix} FCFA</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-700"
                                            onClick={() => handleSelect(item)}
                                        >
                                            Sélectionner
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
