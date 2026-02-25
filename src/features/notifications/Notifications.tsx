import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotificationsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-background pb-32 pt-safe">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-black text-foreground tracking-tight mb-2 flex items-center gap-3">
          <Bell className="w-7 h-7 text-[#064e3b] dark:text-[#059669]" />
          {t("nav.notifications", "Notifications")}
        </h1>
        <p className="text-muted-foreground font-medium text-sm mb-8">
          Consultez vos alertes et mises à jour.
        </p>
        <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-foreground font-bold">Aucune notification pour le moment</p>
          <p className="text-muted-foreground text-sm mt-2">
            Vous serez notifié des nouveaux messages, offres et mises à jour de vos annonces.
          </p>
        </div>
      </div>
    </div>
  );
}
