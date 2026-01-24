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

          <div className="relative rounded-2xl border border-border shadow-card p-8 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-primary mb-3" />
            <div className="font-semibold mb-1">Conversations SWAP</div>
            <div className="text-sm text-muted-foreground">Flux simple, pièces jointes, et alertes intégrées.</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessagingSection;
