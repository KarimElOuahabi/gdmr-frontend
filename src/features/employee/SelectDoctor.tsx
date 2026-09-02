import type { DoctorProfileResponse } from "../doctor/doctorApi";
import { DoctorItem } from "./DoctorItem";
import { EmptyState } from "@/components/common/EmptyState";
import { Stethoscope } from "lucide-react";

interface SelectDoctorProps {
  doctors: DoctorProfileResponse[];
  onOpen: (doctor: DoctorProfileResponse) => void;
}

export function SelectDoctor({ doctors, onOpen }: SelectDoctorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Choose a Doctor</h1>
        <p className="text-muted-foreground">
          Select a doctor to request an appointment.
        </p>
      </div>

      {doctors.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors available"
          description="Check back later — doctors will appear here once they're added."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {doctors.map((doctor) => (
            <DoctorItem key={doctor.id} doctor={doctor} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
