import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

export default function ApplyCard() {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-900">
        Ready to Apply?
      </h2>

      <p className="mt-4 leading-7 text-slate-600">
        Submit your application today and take the next
        step in your career.
      </p>

      <div className="mt-8">
        <Button
          text="Apply Now"
          size="lg"
        />
      </div>
    </Card>
  );
}