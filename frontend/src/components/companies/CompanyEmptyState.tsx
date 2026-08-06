import { Building2 } from "lucide-react";

import PremiumCard from "@/components/ui/PremiumCard";

type CompanyEmptyStateProps = {
  title?: string;
  description?: string;
};

export default function CompanyEmptyState({
  title = "No Companies Found",
  description = "Try changing your search criteria or check back later.",
}: CompanyEmptyStateProps) {
  return (
    <PremiumCard>
      <div className="flex flex-col items-center justify-center py-16 text-center">

        <div
          className="
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            bg-slate-100
          "
        >
          <Building2
            size={36}
            className="text-slate-500"
          />
        </div>

        <h2
          className="
            mt-6
            text-2xl
            font-bold
            text-slate-900
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-3
            max-w-md
            text-slate-600
          "
        >
          {description}
        </p>

      </div>
    </PremiumCard>
  );
}