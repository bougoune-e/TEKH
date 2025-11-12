import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Smartphone, Star } from "lucide-react";

interface PhoneCardProps {
  brand: string;
  model: string;
  condition: string;
  price: number;
  originalPrice?: number;
  image?: string;
  rating?: number;
}

const PhoneCard = ({
  brand,
  model,
  condition,
  price,
  originalPrice,
  image,
  rating = 4.5,
}: PhoneCardProps) => {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Card className="group hover:shadow-card-hover transition-smooth overflow-hidden bg-gradient-card border-border/50 relative">
      {/* Effet de glow au survol */}
      <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
      
      <CardHeader className="p-0 relative">
        <div className="aspect-square bg-gradient-subtle flex items-center justify-center p-8 relative overflow-hidden">
          {/* Effet de lumière animé */}
          <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {image ? (
            <img 
              src={image} 
              alt={`${brand} ${model}`} 
              className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-300" 
            />
          ) : (
            <div className="relative z-10">
              <Smartphone className="h-24 w-24 text-primary/40 group-hover:text-primary transition-smooth group-hover:scale-110" />
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-4 right-4 z-20 bg-gradient-accent text-accent-foreground shadow-glow-accent font-semibold">
              -{discount}%
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-5 space-y-4 relative z-10">
        <div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{brand}</div>
          <h3 className="font-bold text-lg text-foreground mt-1">{model}</h3>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs font-medium">
            {condition}
          </Badge>
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-foreground font-semibold">{rating}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-3 pt-2">
          <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            {price.toLocaleString()} FCFA
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground/70 line-through">
              {originalPrice.toLocaleString()} FCFA
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 relative z-10">
        <Button 
          variant="default" 
          className="w-full group-hover:bg-gradient-hero group-hover:text-primary-foreground transition-smooth group-hover:shadow-glow font-semibold"
        >
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhoneCard;
