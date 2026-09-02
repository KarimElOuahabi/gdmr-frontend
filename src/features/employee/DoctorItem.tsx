import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SeparatorList } from "@/components/common/separator-list";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import type { DoctorProfileResponse } from "../doctor/doctorApi";

interface DoctorItemProps {
  doctor: DoctorProfileResponse;
  onOpen?: (doctor: DoctorProfileResponse) => void;
}

export function DoctorItem({ doctor, onOpen }: DoctorItemProps) {
  const doctorInfo = [
    {
      label: "Doctor",
      value: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    },
    {
      label: "Specialty",
      value: doctor.specialty || "General",
    },
    {
      label: "Work Site",
      value: doctor.workSite || "N/A",
    },
    {
      label: "Phone Number",
      value: doctor.phoneNumber || "N/A",
    },
  ];

  return (
    <Card className="overflow-hidden pb-0">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              {`Dr. ${doctor.firstName} ${doctor.lastName}`}
            </CardTitle>
            <CardDescription className="mt-1">Doctor Profile</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 p-6 pb-4 sm:flex-row sm:items-center">
        <SeparatorList items={doctorInfo} />
      </CardContent>

      {onOpen && (
        <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/30 px-6 pb-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Select this doctor to request an appointment.
          </p>
          <Button
            size="sm"
            className="w-full gap-2 sm:w-auto"
            onClick={() => onOpen(doctor)}
          >
            <CheckCircle2 className="size-4" />
            Select
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
