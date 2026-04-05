import HowItWorks from "@/features/home/HowItWorks";
import { useGoToFooter } from "@/shared/hooks/useGoToFooter";
import { ChevronLeft } from "lucide-react";

export default function HowItWorksPage() {
  const goToFooter = useGoToFooter();
  return (
    <div>
      <div className="container mx-auto px-4 pt-6">
        <button onClick={() => goToFooter()} className="inline-flex items-center gap-2 text-primary font-black mb-2 hover:-translate-x-1 transition-transform">
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>
      </div>
      <HowItWorks />
    </div>
  );
}
