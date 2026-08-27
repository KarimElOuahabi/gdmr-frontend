import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/data-table";
import { useListEmployeesQuery } from "@/features/employee-management/employeeManagementApi";
import type { EmployeeProfileResponse } from "@/features/employee/employeeApi";
import { Eye } from "lucide-react";

const PAGE_SIZE = 10;

function formatDepartment(dept?: string) {
  if (!dept) return "N/A";
  return dept
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function PatientsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data, isLoading } = useListEmployeesQuery({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
  });

  const columns: ColumnDef<EmployeeProfileResponse>[] = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const { firstName, lastName } = row.original;
        const initials =
          `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
        return (
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-slate-100 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      id: "fullName",
      header: "Patient",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {row.original.firstName} {row.original.lastName}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {formatDepartment(row.original.department)}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) =>
        row.original.active ? (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400"
          >
            Inactive
          </Badge>
        ),
    },
    {
      id: "viewProfile",
      header: () => <div className="text-center">View Profile</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            onClick={() => navigate(`/doctor/patients/${row.original.employeeId}`)}
            title="View Profile"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="text-muted-foreground">
          Search and track your patients.
        </p>
      </div>

      <Input
        placeholder="Search by name, CIN, or CNSS number..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        className="max-w-sm"
      />

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
