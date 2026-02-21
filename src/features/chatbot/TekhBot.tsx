import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/core/api/utils";
import mascotVideo from "@/assets/illustrations/simulator/gifrobot.mp4";

// Configuration Gemini — Appel REST direct pour un contrôle maximal
const API_KEY = "AIzaSyBzQROIK5AX0as3FjKv7yggBfp9jpMX3Ww";
const MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `Tu es TekhBot, l'assistant IA officiel et expert de la plateforme TEKH+.
Ton objectif est d'informer, guider et convertir chaque visiteur en utilisateur convaincu du programme SWAP.

IDENTITÉ DE TEKH+ :
TEKH+ est une plateforme africaine d'ÉCHANGE (SWAP) de smartphones et appareils électroniques.
Slogan : "Pour une inclusion numérique de qualité pour tous."
Marché principal : Afrique de l'Ouest (Togo, Lomé). Monnaie : FCFA.
TEKH+ N'EST PAS un site de vente classique. C'est un écosystème de SWAP.

COMMENT FONCTIONNE LE SWAP :
1. ESTIMER : Le Simulateur (/simulateur) estime la valeur de reprise du téléphone via diagnostic IA.
2. CHOISIR : On parcourt les Deals (/deals) pour trouver le téléphone cible. Tous certifiés Grade A, garantie 12 mois.
3. ÉCHANGER : On calcule le "gap SWAP". Ex: téléphone vaut 80 000 FCFA, cible coûte 120 000 → on paie 40 000 FCFA seulement.
- UPGRADE : monter en gamme en payant la différence.
- DOWNGRADE : récupérer du cash en échangeant contre un modèle moins cher.

FONCTIONNALITÉS :
📱 Simulateur (/simulateur) - estimation instantanée de valeur de reprise
🔍 Explorer/Deals (/deals) - catalogue d'appareils pour le swap
📝 Publier (/post) - publier sa propre annonce d'échange
🏪 DealBox (/dealboxes) - appareils certifiés TEKH+ premium, garantie 12 mois
🔧 Diagnose (/diagnose) - diagnostic technique complet
⚙️ Paramètres (/settings) - compte, thème, langue

CHARTE DE PRICING v1.0 :
Le prix dépend de : marque, âge, état (Neuf/Très bon/Bon/Moyen), stockage, RAM.
Garde-fous : échange refusé si VRT > 1.4× prix cible.

MARQUES : Apple, Samsung, Xiaomi, Tecno, Infinix, Google, Huawei, OnePlus, Oppo, Vivo.
PAIEMENT : Mobile Money (Flooz, TMoney), carte bancaire, virement.

TON STYLE :
- Amical, dynamique, professionnel. Emojis tech (📱⚡💎🔄💰).
- Réponses concises (max 3-4 phrases), orientées action.
- Propose les bons liens : /simulateur, /deals, /post, /dealboxes.
- Toujours en français sauf si l'utilisateur parle une autre langue.
RÈGLE D'OR : Toujours orienter vers l'ÉCHANGE (Swap).`;

interface Message {
    role: "user" | "bot";
    content: string;
    timestamp: Date;
}

// Historique formaté pour l'API Gemini REST
function buildContents(messages: Message[], newUserInput: string) {
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // System prompt comme premier échange
    contents.push({ role: "user", parts: [{ text: SYSTEM_PROMPT }] });
    contents.push({ role: "model", parts: [{ text: "Compris. Je suis TekhBot, l'expert Swap de TEKH+. Prêt à aider !" }] });

    // Historique de conversation
    for (const msg of messages) {
        contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        });
    }

    // Nouveau message utilisateur
    contents.push({ role: "user", parts: [{ text: newUserInput }] });

    return contents;
}

async function callGemini(messages: Message[], userInput: string): Promise<string> {
    const body = {
        contents: buildContents(messages, userInput),
        generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
        }
    };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error("[TekhBot] API error:", res.status, errText);
        throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
        console.error("[TekhBot] Empty response:", JSON.stringify(data));
        throw new Error("Réponse Gemini vide");
    }

    return reply;
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
    const [error, setError] = useState<string | null>(null);
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
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input.trim();
        setInput("");
        setIsTyping(true);
        setError(null);

        try {
            const reply = await callGemini(messages, currentInput);
            setMessages(prev => [...prev, {
                role: "bot",
                content: reply,
                timestamp: new Date()
            }]);
        } catch (err: any) {
            console.error("[TekhBot] Error:", err);
            const errorMsg = err?.message || "Erreur inconnue";

            // Fallback : essai avec gemini-1.5-flash si le modèle 2.5 échoue
            try {
                const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
                const body = {
                    contents: buildContents(messages, currentInput),
                    generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
                };
                const res = await fetch(fallbackUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                if (res.ok) {
                    const data = await res.json();
                    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (reply) {
                        setMessages(prev => [...prev, {
                            role: "bot",
                            content: reply,
                            timestamp: new Date()
                        }]);
                        setIsTyping(false);
                        return;
                    }
                }
            } catch { /* fallback also failed */ }

            setError(errorMsg);
            setMessages(prev => [...prev, {
                role: "bot",
                content: "⚠️ Petit souci technique ! Réessaie dans quelques secondes.",
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

            {/* Error Banner */}
            {error && (
                <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center gap-2 text-xs text-red-400">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span className="truncate">{error}</span>
                </div>
            )}

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
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Gemini AI Engine</span>
                </div>
            </div>
        </div>
    );
};
