import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/data-table";
import { buildDoctorColumns } from "@/features/doctor-management/doctorsColumns";
import { useListDoctorsQuery } from "@/features/doctor-management/doctorManagementApi";
import { UpdateDoctorModal } from "@/features/doctor-management/UpdateDoctorModal";
import type { DoctorProfileResponse } from "@/features/doctor/doctorApi";

const PAGE_SIZE = 10;

export function buildDoctorDetailPath(doctorId: number): string {
  return `/admin/doctors/${doctorId}`;
}

export function DoctorsList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] =
    useState<DoctorProfileResponse | null>(null);

  const { data, isLoading } = useListDoctorsQuery({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
  });

  const navigate = useNavigate();

  const columns = buildDoctorColumns({
    onViewProfile: (doctor) => {
      navigate(buildDoctorDetailPath(doctor.id)); // Adjust property if needed depending on doctor profile response ID field
    },
    onEditDoctor: (doctor) => {
      setEditingDoctor(doctor);
      setEditModalOpen(true);
    },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Doctors</h2>
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search doctors..."
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

      <UpdateDoctorModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        editingDoctor={editingDoctor}
      />
    </div>
  );
}
