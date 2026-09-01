import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/common/data-table";
import { buildVisitColumns } from "@/features/visit-management/visitColumns";
import { useListVisitsQuery } from "@/features/visit/visitApi";
import { ALL_VISIT_STATUSES, type VisitStatus } from "@/types/visit";

const PAGE_SIZE = 10;

function readInitialStatus(value: string | null): VisitStatus | undefined {
  return ALL_VISIT_STATUSES.find((s) => s === value);
}

export function VisitsPage() {
  // Dashboards deep-link here with ?status=... to land already filtered
  // (e.g. "No-shows this month" from the HR dashboard).
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<VisitStatus | undefined>(() =>
    readInitialStatus(searchParams.get("status")),
  );

  const { data, isLoading } = useListVisitsQuery({
    page,
    size: PAGE_SIZE,
    status,
  });

  const columns = buildVisitColumns((visit) => navigate(`/visits/${visit.id}`));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Medical Visits</h1>
        <Select
          value={status ?? "ALL"}
          onValueChange={(v) => {
            setStatus(v === "ALL" ? undefined : (v as VisitStatus));
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {ALL_VISIT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        pageCount={data?.totalPages ?? 0}
        pageIndex={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
