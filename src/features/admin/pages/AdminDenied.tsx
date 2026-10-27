import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/auth.context";
import { ShieldX } from "lucide-react";

export default function AdminDenied() {
  const { user } = useAuth();
  const u = user as any;
  const email = u?.email || u?.user_metadata?.email || "(email non disponible)";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <ShieldX className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold">Accès admin refusé</h1>
        <p className="text-muted-foreground text-sm">
          Vous êtes connecté avec : <strong className="text-foreground break-all">{email}</strong>
        </p>
        <p className="text-left bg-muted/50 rounded-lg p-4 text-sm">
          Demandez à un administrateur de vous attribuer le rôle <code className="bg-muted px-1 rounded">ADMIN</code>
          dans les App Metadata Supabase. Les droits sont appliqués côté serveur par les politiques Supabase.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/admin" className="text-sm text-primary hover:underline">Réessayer /admin</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">Retour à l’accueil</Link>
        </div>
      </div>
    </div>
  );
}
