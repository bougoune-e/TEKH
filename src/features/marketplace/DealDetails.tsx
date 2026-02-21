import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDeals } from "@/features/marketplace/deals.context";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Phone as PhoneIcon, MessageCircle, Mail, ChevronLeft, MapPin, ShieldCheck, Smartphone, Facebook, Twitter } from "lucide-react";
import SwapGapWidget from "@/features/marketplace/SwapGapWidget";
import { CertificationDetails } from "@/features/marketplace/DealboxComponents";

export default function DealDetails() {
  const { id } = useParams<{ id: string }>();
  const { deals } = useDeals();
  const deal = useMemo(() => deals.find((d) => d.id === id), [deals, id]);
  const [showPhone, setShowPhone] = useState(false);

  if (!deal) {
    return (
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link to="/deals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" /> Retour aux deals
            </Link>
          </div>
          <Card className="p-8 text-center">
            <div className="text-lg font-semibold mb-2">Deal introuvable</div>
            <div className="text-muted-foreground">Vérifiez le lien ou parcourez les deals disponibles.</div>
            <div className="mt-6"><Link to="/deals"><Button>Voir les deals</Button></Link></div>
          </Card>
        </div>
      </section>
    );
  }

  const phoneDigits = (deal.contactWhatsapp || deal.contactPhone || "").replace(/\D/g, "");
  const waHref = phoneDigits ? `https://wa.me/${phoneDigits}` : undefined;
  const mailHref = deal.contactEmail ? `mailto:${deal.contactEmail}` : undefined;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/deals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Retour
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Media */}
          <Card className="lg:col-span-2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="aspect-[4/3] bg-muted/40 w-full flex items-center justify-center">
              {deal.images?.[0] ? (
                <img src={deal.images[0]} alt={`${deal.brand} ${deal.model}`} className="w-full h-full object-contain" />
              ) : (
                <Smartphone className="h-20 w-20 text-muted-foreground" />
              )}
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{deal.brand}</div>
                <h1 className="text-2xl font-bold text-foreground">{deal.title || `${deal.brand} ${deal.model}`}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="secondary">{deal.condition}</Badge>
                  {deal.verified && <Badge className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Vérifié</Badge>}
                  {deal.location && (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {deal.location}</span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-bold text-primary">{deal.price.toLocaleString()} FCFA</div>
                {deal.estimatedValue && (
                  <div className="text-sm text-muted-foreground">Valeur estimée: {deal.estimatedValue.toLocaleString()} FCFA</div>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <div className="font-semibold">Détails du produit</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {deal.model && <li>Modèle: {deal.model}</li>}
                  {deal.storage && <li>Stockage: {deal.storage} Go</li>}
                  {deal.ram && <li>RAM: {deal.ram} Go</li>}
                  {deal.color && <li>Couleur: {deal.color}</li>}
                </ul>
              </div>

              {deal.description && (
                <div className="pt-2">
                  <div className="font-semibold mb-1">Description</div>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{deal.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dealbox Certification Block */}
          {deal.verified && (
            <div className="lg:col-span-2">
              <CertificationDetails />
            </div>
          )}

          {/* Seller / Actions */}
          <div className="space-y-4 lg:sticky lg:top-24">

            <SwapGapWidget dealPrice={deal.price} dealId={deal.id} />

            <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-card">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg">{deal.sellerName || "Vendeur"}</CardTitle>
                <div className="text-sm text-muted-foreground">Contactez le vendeur pour finaliser l'échange</div>
              </CardHeader>
              <div className="space-y-3">
                <Button size="lg" variant="default" className="w-full justify-center gap-2 h-11 bg-black text-white dark:bg-white dark:text-black" onClick={() => setShowPhone(true)}>
                  <PhoneIcon className="h-4 w-4" /> {showPhone ? (deal.contactPhone || "Non fourni") : "Voir le numéro"}
                </Button>
                <Button asChild size="lg" variant="default" className="w-full justify-center gap-2 h-11 bg-green-600 hover:bg-green-700">
                  <a href={waHref || "#"} aria-disabled={!waHref} onClick={(e) => { if (!waHref) e.preventDefault(); }} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" /> Whatsapp
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full justify-center gap-2 h-11">
                  <a href={mailHref || "#"} aria-disabled={!mailHref} onClick={(e) => { if (!mailHref) e.preventDefault(); }}>
                    <Mail className="h-4 w-4" /> Envoyer un email
                  </a>
                </Button>
              </div>
            </Card>

            <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-card">
              <div className="text-sm text-muted-foreground mb-3">Partagez cette annonce avec vos amis</div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="default" className="rounded-full bg-[#25D366] hover:bg-[#1EBE5A] text-white">
                  <a href={waHref || "#"} target="_blank" rel="noopener noreferrer" aria-label="Partager sur Whatsapp">
                    <MessageCircle className="h-4 w-4 mr-1 text-white" /> Whatsapp
                  </a>
                </Button>
                <Button size="sm" variant="default" className="rounded-full bg-[#1877F2] hover:bg-[#166FE0] text-white" aria-label="Partager sur Facebook">
                  <Facebook className="h-4 w-4 mr-1 text-white" /> Facebook
                </Button>
                <Button size="sm" variant="default" className="rounded-full bg-[#1DA1F2] hover:bg-[#1991DA] text-white" aria-label="Partager sur Twitter">
                  <Twitter className="h-4 w-4 mr-1 text-white" /> Twitter
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full" aria-label="Partager par Email">
                  <a href={mailHref || "#"}><Mail className="h-4 w-4 mr-1" /> Email</a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
