import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/data-table";
import { buildEmployeeColumns } from "@/features/employee-management/employeesColumns";
import { useListEmployeesQuery } from "@/features/employee-management/employeeManagementApi";
import { UpdateEmployeeModal } from "@/features/employee-management/UpdateEmployeeModal";
import type { EmployeeProfileResponse } from "@/features/employee/employeeApi";

const PAGE_SIZE = 10;

export function buildEmployeeDetailPath(employeeId: number): string {
  return `/admin/employees/${employeeId}`;
}

export function EmployeesList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeProfileResponse | null>(null);

  const { data, isLoading } = useListEmployeesQuery({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
  });

  const navigate = useNavigate();

  const columns = buildEmployeeColumns({
    onViewProfile: (employee) => {
      navigate(buildEmployeeDetailPath(employee.employeeId)); // GET → Employee.id, correct
    },
    onEditEmployee: (employee) => {
      setEditingEmployee(employee);
      setEditModalOpen(true); // ouvre le modal, ne navigue plus
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by name, CIN, or CNSS number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
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

      <UpdateEmployeeModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        editingEmployee={editingEmployee}
      />
    </div>
  );
}
