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
        <div className="text-left bg-muted/50 rounded-lg p-4 text-sm space-y-2">
          <p>Pour accéder à l’admin :</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Ouvrez le fichier <code className="bg-muted px-1 rounded">.env</code> à la <strong>racine du projet</strong> (là où se trouve <code className="bg-muted px-1 rounded">vite.config.ts</code>).</li>
            <li>Ajoutez ou modifiez : <code className="block mt-1 bg-muted p-2 rounded break-all">VITE_ADMIN_EMAILS={email}</code></li>
            <li>Redémarrez le serveur (<code className="bg-muted px-1 rounded">npm run dev</code>).</li>
            <li>Rechargez la page <Link to="/admin" className="text-primary underline">/admin</Link>.</li>
          </ol>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/admin" className="text-sm text-primary hover:underline">Réessayer /admin</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">Retour à l’accueil</Link>
        </div>
      </div>
    </div>
  );
}
