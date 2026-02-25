import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDeals } from "@/features/marketplace/deals.context";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Phone as PhoneIcon, MessageCircle, Mail, ChevronLeft, MapPin, ShieldCheck, Smartphone, Facebook, Twitter, Calendar, ChevronRight, ChevronLeft as ChevronLeftIcon } from "lucide-react";
import SwapGapWidget from "@/features/marketplace/SwapGapWidget";
import { CertificationDetails } from "@/features/marketplace/DealboxComponents";
import { cn } from "@/core/api/utils";

export default function DealDetails() {
  const { id } = useParams<{ id: string }>();
  const { deals } = useDeals();
  const deal = useMemo(() => deals.find((d) => d.id === id), [deals, id]);
  const [showPhone, setShowPhone] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const images = deal?.images?.filter(Boolean) ?? [];
  const hasMultipleImages = images.length > 1;

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
    <section className="py-10 pb-28 md:pb-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/deals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Retour
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Media + infos principales */}
          <Card className="lg:col-span-2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg ring-0">
            <div className="relative aspect-[4/3] bg-muted/30 w-full flex items-center justify-center p-4">
              {images[imageIndex] ? (
                <img src={images[imageIndex]} alt={`${deal.brand} ${deal.model} ${imageIndex + 1}`} className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Smartphone className="h-20 w-20 text-muted-foreground" />
              )}
              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                    aria-label="Photo précédente"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center"
                    aria-label="Photo suivante"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageIndex(i)}
                        className={cn("w-2 h-2 rounded-full transition-colors", i === imageIndex ? "bg-primary" : "bg-white/60 hover:bg-white/80")}
                        aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{deal.brand}</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{deal.title || `${deal.brand} ${deal.model}`}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="secondary">{deal.condition}</Badge>
                  {deal.verified && <Badge className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Vérifié</Badge>}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">Offre valable 72h</span>
                  {(deal.publishedAt || deal.createdAt) && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Publié le {new Date(deal.publishedAt || deal.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  {deal.location && (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {deal.location}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <div className="text-3xl font-black tracking-tight text-[hsl(var(--tekh-green))]">{deal.price.toLocaleString()} <span className="text-lg font-bold text-muted-foreground">FCFA</span></div>
                {deal.estimatedValue && (
                  <div className="text-sm text-muted-foreground">Valeur estimée: {deal.estimatedValue.toLocaleString()} FCFA</div>
                )}
              </div>

              <div className="pt-4 border-t border-border/60 space-y-2">
                <div className="font-semibold text-foreground">Détails du produit</div>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  {deal.model && <li>Modèle: {deal.model}</li>}
                  {deal.storage && <li>Stockage: {deal.storage} Go</li>}
                  {deal.ram && <li>RAM: {deal.ram} Go</li>}
                  {deal.color && <li>Couleur: {deal.color}</li>}
                </ul>
              </div>

              {deal.description && (
                <div className="pt-4 border-t border-border/60">
                  <div className="font-semibold text-foreground mb-2">Description</div>
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

          {/* Colonne droite : simulateur + contact */}
          <div className="space-y-5 lg:sticky lg:top-24">

            <SwapGapWidget dealPrice={deal.price} dealId={deal.id} />

            <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-lg ring-0">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold">{deal.sellerName || "Vendeur"}</CardTitle>
                <div className="text-sm text-muted-foreground">Contactez le vendeur pour finaliser l'échange</div>
              </CardHeader>
              <div className="space-y-3">
                <Button size="lg" variant="default" className="w-full justify-center gap-2 h-11 bg-foreground text-background hover:opacity-90" onClick={() => setShowPhone(true)}>
                  <PhoneIcon className="h-4 w-4" /> {showPhone ? (deal.contactPhone || "Non fourni") : "Voir le numéro"}
                </Button>
                <Button asChild size="lg" variant="default" className="w-full justify-center gap-2 h-11 bg-[hsl(var(--tekh-green))] hover:bg-[hsl(var(--tekh-green))]/90 text-white">
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

            <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-card ring-0">
              <div className="text-sm text-muted-foreground mb-3">Partagez cette annonce</div>
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
