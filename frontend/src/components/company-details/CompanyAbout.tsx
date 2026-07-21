import Card from "@/components/common/Card";

export default function CompanyAbout() {
  return (
    <Card>

      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        About Company
      </h2>

      <div className="space-y-6 leading-8 text-slate-600">

        <p>
          ABC Logistics is a leading logistics and supply chain
          company providing warehousing, transportation,
          inventory management, and distribution services across
          Asia and the Middle East.
        </p>

        <p>
          The company is committed to innovation, operational
          excellence, and customer satisfaction while creating
          long-term career opportunities for talented
          professionals.
        </p>

        <p>
          With modern facilities and experienced teams,
          ABC Logistics continues to expand its regional
          operations and deliver reliable logistics solutions
          for international clients.
        </p>

      </div>

    </Card>
  );
}