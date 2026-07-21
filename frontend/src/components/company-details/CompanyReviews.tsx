import Card from "@/components/common/Card";
import { Star } from "lucide-react";

export default function CompanyReviews() {
  const reviews = [
    {
      name: "Ahmed Khan",
      rating: 5,
      review:
        "Excellent work environment with supportive management and career growth opportunities.",
    },
    {
      name: "Sara Ali",
      rating: 4,
      review:
        "Professional team and modern warehouse facilities. Great learning experience.",
    },
  ];

  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Employee Reviews
      </h2>

      <div className="space-y-8">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="border-b border-slate-200 pb-6 last:border-none last:pb-0"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">
                {review.name}
              </h3>

              <div className="flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 leading-7 text-slate-600">
              {review.review}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}