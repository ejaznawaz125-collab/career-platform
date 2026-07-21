import Button from "@/components/common/Button";

export default function JobsPagination() {
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <Button
        text="Previous"
        variant="outline"
        size="sm"
      />

      <Button
        text="1"
        variant="primary"
        size="sm"
      />

      <Button
        text="2"
        variant="outline"
        size="sm"
      />

      <Button
        text="3"
        variant="outline"
        size="sm"
      />

      <Button
        text="Next"
        variant="outline"
        size="sm"
      />
    </div>
  );
}