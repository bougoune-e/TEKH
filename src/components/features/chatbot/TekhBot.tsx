import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageSquare, Send, X, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import mascotVideo from "@/assets/illustrations/simulator/gifrobot.mp4";

// Configuration Gemini
const API_KEY = "AIzaSyBzQROIK5AX0as3FjKv7yggBfp9jpMX3Ww";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `
Tu es TekhBot, l'assistant intelligent et expert de la plateforme TEKH+. 
Ton objectif est de convertir chaque visiteur en un utilisateur convaincu du programme SWAP.

CONNAISSANCES CRUCIALES :
- TEKH+ n'est pas un site de vente classique, c'est une plateforme d'ÉCHANGE (SWAP).
- On peut "Upgrade" (monter en gamme) ou "Downgrade" (récupérer du cash).
- Le diagnostic est instantané et certifié par IA via notre simulateur.
- Les téléphones proposés sont Grade A (comme neufs) avec garantie 12 mois.
- L'économie circulaire et l'inclusion numérique sont au cœur de notre ADN.

TON STYLE :
- Amical, dynamique et hautement professionnel.
- Utilise des emojis tech (📱, ⚡, 💎, 🔄) pour dynamiser l'échange.
- Réponses concises et orientées action (propose le simulateur, les deals, etc.).
- Si l'utilisateur hésite, rappelle-lui que swapper son téléphone est plus rentable que d'en acheter un neuf.

RÈGLE D'OR : Toujours orienter vers l'ÉCHANGE (Swap).
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
            content: "Salut ! Je suis TekhBot 🤖. Prêt à optimiser ton budget smartphone via le Swap aujourd'hui ?",
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
        // ... same handleSend logic ...
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
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                    { role: "model", parts: [{ text: "Entendu. Je suis TekhBot, l'expert Swap de TEKH+." }] },
                    ...messages.map(m => ({
                        role: m.role === "user" ? "user" : "model",
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
                content: "Oups, ma connexion a sauté ! Peux-tu répéter ?",
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
            // Mobile: Full screen with offset for top bar if needed, but inset-0 is standard
            "inset-0 rounded-none",
            // Desktop: Floating bottom-right but centered for focus? No, let's keep it clean
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

            {/* Messages Section - Dark Mode Focus */}
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

            {/* Input Section - Pure Black Blur */}
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
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-500">Gemini 1.5 Professional Engine</span>
                </div>
            </div>
        </div>
    );
};
