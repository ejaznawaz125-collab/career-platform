import Card from "@/components/common/Card";
import { ImageIcon } from "lucide-react";

export default function CompanyGallery() {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Company Gallery
      </h2>

      <div className="grid gap-6 md:grid-cols-3">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100"
          >
            <div className="text-center">
              <ImageIcon
                size={42}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 text-sm text-slate-500">
                Image Placeholder
              </p>
            </div>
          </div>
        ))}

      </div>
    </Card>
  );
}