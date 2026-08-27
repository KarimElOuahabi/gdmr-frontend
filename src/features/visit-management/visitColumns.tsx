import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { VisitResponse } from "@/features/visit/visitApi";

const statusVariant: Record<string, "default" | "outline" | "destructive"> = {
  SCHEDULED: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "default",
  ABSENT: "destructive",
};

export function buildVisitColumns(): ColumnDef<VisitResponse>[] {
  return [
    {
      accessorKey: "confirmedDateTime",
      header: "Date",
      cell: ({ row }) =>
        row.original.confirmedDateTime
          ? new Date(row.original.confirmedDateTime).toLocaleString()
          : "—",
    },
    {
      accessorKey: "employeeId",
      header: "Employee",
      cell: ({ row }) => `#${row.original.employeeId}`,
    },
    {
      accessorKey: "doctorId",
      header: "Doctor",
      cell: ({ row }) => `#${row.original.doctorId}`,
    },
    {
      accessorKey: "visitType",
      header: "Type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] ?? "outline"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "motif",
      header: "Reason",
      cell: ({ row }) => row.original.motif ?? "—",
    },
  ];
}
