import Card from "@/components/common/Card";

export default function JobDescription() {
  return (
    <Card>
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Job Description
      </h2>

      <div className="space-y-4 leading-8 text-slate-600">
        <p>
          We are looking for an experienced Warehouse Supervisor to
          manage daily warehouse operations, inventory accuracy, and
          team performance.
        </p>

        <p>
          The successful candidate will ensure smooth receiving,
          storage, picking, packing, and dispatch processes while
          maintaining safety and operational standards.
        </p>

        <p>
          You will work closely with logistics, procurement, and
          operations teams to improve warehouse efficiency and support
          business growth.
        </p>
      </div>
    </Card>
  );
}