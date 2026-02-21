import { MessageSquare, Paperclip, History, ShieldAlert } from "lucide-react";

const features = [
  { icon: MessageSquare, title: "Chat instantané", desc: "Discutez en temps réel avec l'autre partie, notifications incluses." },
  { icon: Paperclip, title: "Pièces jointes", desc: "Ajoutez des photos/vidéos de l'appareil pour faciliter la décision." },
  { icon: History, title: "Historique conservé", desc: "Retrouvez vos échanges à tout moment, classés par deals." },
  { icon: ShieldAlert, title: "Signalement", desc: "Signalez un comportement suspect, notre équipe intervient rapidement." },
];

const MessagingSection = () => {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-3">Messagerie sécurisée</h2>
            <p className="text-muted-foreground mb-6">
              Échangez en toute sécurité sur SWAP grâce à une messagerie intégrée, pensée pour la négociation et la vérification des détails du téléphone.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f.title} className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-card-hover transition-smooth">
                  <div className="flex items-start gap-3">
                    <f.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-semibold">{f.title}</div>
                      <div className="text-sm text-muted-foreground">{f.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-green-400 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative rounded-2xl border-2 border-black dark:border-white shadow-2xl p-8 text-center bg-white dark:bg-zinc-900 group-hover:-translate-y-1 transition-all duration-300">
              <div className="h-20 w-20 bg-green-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-black dark:text-white">Messagerie WhatsApp</h3>
              <p className="text-sm text-muted-foreground mb-8">
                Échanges directs, sécurisés et rapides via notre canal officiel certifié.
                Négociez et finalisez vos deals en toute simplicité.
              </p>
              <a
                href="https://wa.me/yournumber"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-4 px-6 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Ouvrir mon WhatsApp
              </a>
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                Opérationnel 24/7
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessagingSection;
