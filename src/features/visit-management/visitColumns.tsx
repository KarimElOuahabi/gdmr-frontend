import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { VisitResponse } from "@/features/visit/visitApi";

const statusVariant: Record<string, "default" | "outline" | "destructive"> = {
  SCHEDULED: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "default",
  ABSENT: "destructive",
};

export function buildVisitColumns(
  onView: (visit: VisitResponse) => void,
): ColumnDef<VisitResponse>[] {
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
      id: "view",
      header: () => <div className="text-center">Details</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            onClick={() => onView(row.original)}
            title="View visit details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
