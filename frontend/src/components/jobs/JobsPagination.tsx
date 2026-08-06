"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import Button from "@/components/common/Button";

type JobsPaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function JobsPagination({
  currentPage,
  totalPages,
}: JobsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    router.push(
      `${pathname}?${params.toString()}`,
    );
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <Button
        text="Previous"
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      />

      {Array.from(
        { length: totalPages },
        (_, i) => i + 1,
      ).map((page) => (
        <Button
          key={page}
          text={String(page)}
          variant={
            page === currentPage
              ? "primary"
              : "outline"
          }
          size="sm"
          onClick={() => goToPage(page)}
        />
      ))}

      <Button
        text="Next"
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
      />
    </div>
  );
}