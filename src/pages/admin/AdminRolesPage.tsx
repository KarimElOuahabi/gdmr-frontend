import { DataTable } from "@/components/common/data-table";
import { useGetRolesStatsQuery } from "@/features/admin/adminRolesApi";
import { rolesColumns } from "@/features/admin/rolesColumns";

export function AdminRolesPage() {
  const { data, isLoading } = useGetRolesStatsQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Roles</h2>
      </div>

      <DataTable
        columns={rolesColumns}
        data={data ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
