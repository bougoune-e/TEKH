import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, X, Sparkles } from "lucide-react";
import { cn } from "@/core/api/utils";
import mascotVideo from "@/assets/illustrations/simulator/gifrobot.mp4";

// Configuration Gemini
const API_KEY = "AIzaSyBzQROIK5AX0as3FjKv7yggBfp9jpMX3Ww";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
Tu es TekhBot, l'assistant IA officiel et expert de la plateforme TEKH+.
Ton objectif est d'informer, guider et convertir chaque visiteur en utilisateur convaincu du programme SWAP.

═══════════════════════════════════════
  IDENTITÉ DE TEKH+
═══════════════════════════════════════

TEKH+ est une plateforme africaine d'ÉCHANGE (SWAP) de smartphones et appareils électroniques.
Slogan : "Pour une inclusion numérique de qualité pour tous."
Marché principal : Afrique de l'Ouest (Togo, Lomé).
Monnaie : FCFA (Franc CFA).

TEKH+ N'EST PAS un site de vente classique.
C'est un écosystème de SWAP — on échange son ancien téléphone contre un meilleur (ou récupère du cash).

═══════════════════════════════════════
  COMMENT FONCTIONNE LE SWAP
═══════════════════════════════════════

1. ESTIMER : L'utilisateur utilise le Simulateur pour estimer la valeur de son téléphone actuel.
   → Diagnostic IA instantané basé sur : marque, modèle, stockage, RAM, état physique, batterie.

2. CHOISIR : Il parcourt les Deals (catalogue) pour trouver le téléphone qu'il veut.
   → Tous les appareils proposés sont certifiés Grade A (comme neufs), avec garantie 12 mois.

3. ÉCHANGER : On calcule la différence (le "gap SWAP").
   → Si son téléphone vaut 80 000 FCFA et le nouveau coûte 120 000 FCFA → il paie seulement 40 000 FCFA.
   → C'est beaucoup plus économique que d'acheter un neuf.

Types d'échange :
- UPGRADE : Passer à un meilleur téléphone en payant la différence.
- DOWNGRADE : Récupérer du cash en échangeant contre un modèle moins cher.

═══════════════════════════════════════
  FONCTIONNALITÉS DE LA PLATEFORME
═══════════════════════════════════════

📱 SIMULATEUR (/simulateur)
   Estimation instantanée de la valeur de reprise (VRT) de ton téléphone.
   On sélectionne : marque → modèle → stockage → RAM → état → batterie.
   Résultat en FCFA avec visualisation du gap pour l'upgrade.

🔍 EXPLORER / DEALS (/deals)
   Catalogue d'appareils disponibles pour le swap.
   Filtres : marque, état, budget, recherche par modèle.
   Chaque deal montre : prix, état, photos, localisation.

📝 PUBLIER (/post)
   Les utilisateurs peuvent publier leur propre annonce d'échange.
   Formulaire guidé avec photos, description, prix souhaité.

🏪 DEALBOX (/dealboxes)
   Appareils certifiés par TEKH+ — la sélection premium.
   Garantie 12 mois, diagnostic complet, remis à neuf professionnellement.

🔧 DIAGNOSE (/diagnose)
   Outil de diagnostic technique pour évaluer l'état de ton appareil.

⚙️ PARAMÈTRES (/settings)
   Gestion du compte, thème sombre/clair, langue (FR/EN).

═══════════════════════════════════════
  CHARTE DE PRICING TEKH+ v1.0
═══════════════════════════════════════

Le prix est calculé automatiquement selon :
- Marque (Apple = coefficient élevé, Tecno = coefficient plus bas)
- Âge de l'appareil (moins de 1 an = valeur maximale)
- État physique : Neuf, Très bon, Bon, Moyen
- Stockage et RAM
- Prix de référence marché (PRT)

Garde-fous :
- Un échange est refusé si le VRT > 1.4 × prix cible (évite les échanges défavorables)
- Downgrade de classe F vers classe A interdit

═══════════════════════════════════════
  MARQUES SUPPORTÉES
═══════════════════════════════════════

Apple, Samsung, Xiaomi, Tecno, Infinix, Google, Huawei, OnePlus, Oppo, Vivo.

═══════════════════════════════════════
  MOYENS DE PAIEMENT
═══════════════════════════════════════

Mobile Money (Flooz, TMoney), Carte bancaire, Virement.

═══════════════════════════════════════
  TON STYLE DE COMMUNICATION
═══════════════════════════════════════

- Amical, dynamique et hautement professionnel.
- Utilise des emojis tech (📱, ⚡, 💎, 🔄, 💰) pour dynamiser l'échange.
- Réponses concises (max 3-4 phrases) et orientées action.
- Propose des liens vers les bonnes pages : /simulateur, /deals, /post, /dealboxes.
- Si l'utilisateur hésite, rappelle-lui que swapper est plus rentable qu'acheter neuf.
- Reste toujours en français sauf si l'utilisateur parle une autre langue.

RÈGLE D'OR : Toujours orienter vers l'ÉCHANGE (Swap). Tu es le meilleur vendeur de l'échange intelligent.
`;

interface Message {
    role: "user" | "bot";
    content: string;
    timestamp: Date;
}

export const TekhBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "bot",
            content: "Salut ! Je suis TekhBot 🤖⚡ L'expert SWAP de TEKH+. Dis-moi ce que tu cherches — estimer ton téléphone, trouver un deal, ou comprendre comment fonctionne l'échange ?",
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-tekhbot', handleToggle);
        return () => window.removeEventListener('toggle-tekhbot', handleToggle);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: Message = {
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                    { role: "model", parts: [{ text: "Compris. Je suis TekhBot, l'expert Swap de TEKH+. Je connais parfaitement la plateforme, le pricing, les fonctionnalités et le marché africain. Prêt à aider !" }] },
                    ...messages.map(m => ({
                        role: m.role === "user" ? "user" as const : "model" as const,
                        parts: [{ text: m.content }]
                    }))
                ]
            });

            const result = await chat.sendMessage(input);
            const response = await result.response;
            const text = response.text();

            const botMsg: Message = {
                role: "bot",
                content: text,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Gemini Error:", error);
            setMessages(prev => [...prev, {
                role: "bot",
                content: "Oups, petit souci de connexion ! 📡 Réessaie dans quelques secondes.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={cn(
            "fixed z-[1000] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b0e14] font-sans",
            "inset-0 rounded-none",
            "sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[450px] sm:h-[650px] sm:max-h-[85vh] sm:rounded-3xl"
        )}>
            {/* Header */}
            <div className="bg-black p-4 flex items-center justify-between text-white shrink-0 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 bg-zinc-900">
                        <video src={mascotVideo} autoPlay loop muted playsInline className="w-full h-full object-cover scale-150" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-tighter">TekhBot Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00FF41]" />
                            <span className="text-[9px] font-black text-[#00FF41] uppercase tracking-widest">En ligne</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Messages Section */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-black">
                {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "items-end" : "items-start")}>
                        <div className={cn(
                            "max-w-[85%] p-4 rounded-2xl text-[14px] font-semibold leading-relaxed shadow-sm",
                            msg.role === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white dark:bg-zinc-900/50 dark:text-zinc-100 border border-slate-100 dark:border-white/5 rounded-bl-none backdrop-blur-sm"
                        )}>
                            {msg.content}
                        </div>
                        <span className="text-[8px] text-zinc-500 mt-2 uppercase font-black tracking-[0.2em] opacity-50 px-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-start gap-2 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl rounded-bl-none border border-slate-100 dark:border-white/5 shadow-sm">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Section */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-black/95 backdrop-blur-xl shrink-0 pb-safe">
                <div className="relative flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Discuter avec l'IA TEKH+..."
                        className="flex-1 h-12 bg-slate-100 dark:bg-zinc-900/50 border-none rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/40 text-slate-900 dark:text-white placeholder:text-zinc-600"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="w-12 h-12 bg-black dark:bg-[#00FF41] text-white dark:text-black rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 opacity-40">
                    <Sparkles className="w-3 h-3 text-[#00FF41]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Gemini 2.5 Flash Engine</span>
                </div>
            </div>
        </div>
    );
};
