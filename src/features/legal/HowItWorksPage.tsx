import HowItWorks from "@/features/home/HowItWorks";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function HowItWorksPage() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="container mx-auto px-4 pt-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-primary font-black mb-2 hover:-translate-x-1 transition-transform">
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>
      </div>
      <HowItWorks />
    </div>
  );
}
