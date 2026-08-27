import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Paperclip } from "lucide-react";
import { useListEmployeesQuery } from "@/features/employee-management/employeeManagementApi";
import { useListDoctorsQuery } from "@/features/doctor-management/doctorManagementApi";
import { useCreateScheduledVisitMutation } from "@/features/visit/visitApi";
import { useUploadDocumentMutation } from "@/features/document/documentApi";
import { SlotPicker } from "@/features/visit/SlotPicker";

const ACCEPTED_ATTACHMENT_TYPES = "application/pdf,image/jpeg,image/png";

export function CreateVisitPage() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Matches on first name, last name, or both together (e.g. "john smith"),
  // so HR can search a specific employee instead of scrolling a full list.
  const { data: employeesData } = useListEmployeesQuery({
    search: employeeSearch || undefined,
    page: 0,
    size: 20,
  });
  const { data: doctorsData } = useListDoctorsQuery({ page: 0, size: 100 });
  const [createScheduledVisit, { isLoading }] =
    useCreateScheduledVisitMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  const [certificate, setCertificate] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedEmployee = employeesData?.content.find(
    (e) => e.employeeId === employeeId,
  );

  const handleSlotReady = async (timeSlotId: number) => {
    if (!employeeId || !doctorId) return;
    try {
      const visit = await createScheduledVisit({
        employeeId,
        doctorId,
        timeSlotId,
      }).unwrap();

      if (certificate && selectedEmployee) {
        try {
          await uploadDocument({
            documentType: "FITNESS_CERTIFICATE",
            file: certificate,
            employeeUserId: selectedEmployee.id,
            visitId: visit.id,
          }).unwrap();
        } catch {
          toast.add({
            title: "Visit scheduled, but attachment failed",
            description:
              "The visit was created. You can attach the certificate later from the visit's documents.",
          });
          navigate("/hr/visit-requests");
          return;
        }
      }

      toast.add({
        title: "Visit scheduled",
        description: "The employee can now confirm this appointment.",
      });
      navigate("/hr/visit-requests");
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to schedule the visit.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule a visit</h1>
        <p className="text-muted-foreground">
          Create a medical visit directly (onboarding, annual checkup, return
          from leave, etc.) without waiting for an employee request.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="employeeSearch">Employee</FieldLabel>
          <Input
            id="employeeSearch"
            placeholder="Search by name, CIN, or CNSS number..."
            value={employeeSearch}
            onChange={(e) => {
              setEmployeeSearch(e.target.value);
              setEmployeeId(null);
            }}
            className="mb-2"
          />
          <Select
            value={employeeId ? String(employeeId) : undefined}
            onValueChange={(v) => setEmployeeId(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              {employeesData?.content.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No matching employees.
                </p>
              )}
              {employeesData?.content.map((e) => (
                <SelectItem key={e.employeeId} value={String(e.employeeId)}>
                  {e.firstName} {e.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Doctor</FieldLabel>
          <Select
            value={doctorId ? String(doctorId) : undefined}
            onValueChange={(v) => setDoctorId(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctorsData?.content.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  Dr. {d.firstName} {d.lastName} — {d.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="certificate">
            Healing / fitness certificate (optional)
          </FieldLabel>
          <input
            ref={fileInputRef}
            id="certificate"
            type="file"
            accept={ACCEPTED_ATTACHMENT_TYPES}
            className="hidden"
            onChange={(e) => setCertificate(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-4" />
            {certificate
              ? certificate.name
              : "Attach a certificate the employee provided (e.g. after illness or maternity leave)"}
          </Button>
        </Field>
      </FieldGroup>

      {doctorId && employeeId && (
        <SlotPicker
          doctorId={doctorId}
          defaultVisitType="PRE_EMPLOYMENT"
          onSlotReady={handleSlotReady}
          isSubmitting={isLoading}
          submitLabel="Schedule visit"
        />
      )}

      {(!doctorId || !employeeId) && (
        <Button variant="outline" disabled className="w-full">
          Select an employee and a doctor to continue
        </Button>
      )}
    </div>
  );
}
