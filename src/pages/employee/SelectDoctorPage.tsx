import { useNavigate } from "react-router-dom";
import { useListDoctorsQuery } from "@/features/doctor-management/doctorManagementApi";
import { SelectDoctor } from "@/features/employee/SelectDoctor";
import type { DoctorProfileResponse } from "@/features/doctor/doctorApi";

export function SelectDoctorPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useListDoctorsQuery({ page: 0, size: 50 });

  if (isLoading) return <div>Loading doctors...</div>;

  const handleOpenSlots = (doctor: DoctorProfileResponse) => {
    navigate(`/employee/doctors/${doctor.userId}/request`);
  };

  return (
    <SelectDoctor doctors={data?.content ?? []} onOpen={handleOpenSlots} />
  );
}
