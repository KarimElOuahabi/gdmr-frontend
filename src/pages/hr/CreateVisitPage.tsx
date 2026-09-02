import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { Paperclip, User, X } from "lucide-react";
import { useListEmployeesQuery } from "@/features/employee-management/employeeManagementApi";
import type { EmployeeProfileResponse } from "@/features/employee/employeeApi";
import { useListDoctorsQuery } from "@/features/doctor-management/doctorManagementApi";
import type { DoctorProfileResponse } from "@/features/doctor/doctorApi";
import { useCreateScheduledVisitMutation } from "@/features/visit/visitApi";
import { useUploadDocumentMutation } from "@/features/document/documentApi";
import { SlotPicker } from "@/features/visit/SlotPicker";

const ACCEPTED_ATTACHMENT_TYPES = "application/pdf,image/jpeg,image/png";

export function CreateVisitPage() {
  const navigate = useNavigate();

  const [employeeNameSearch, setEmployeeNameSearch] = useState("");
  const [employeeIdSearch, setEmployeeIdSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeProfileResponse | null>(null);

  const [doctorNameSearch, setDoctorNameSearch] = useState("");
  const [doctorIdSearch, setDoctorIdSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorProfileResponse | null>(null);

  const hasEmployeeSearch = !!employeeNameSearch || !!employeeIdSearch;
  const hasDoctorSearch = !!doctorNameSearch || !!doctorIdSearch;

  const { data: employeesData } = useListEmployeesQuery(
    {
      search: employeeNameSearch || undefined,
      idSearch: employeeIdSearch || undefined,
      page: 0,
      size: 20,
    },
    { skip: !!selectedEmployee || !hasEmployeeSearch },
  );
  const { data: doctorsData } = useListDoctorsQuery(
    {
      search: doctorNameSearch || undefined,
      idSearch: doctorIdSearch || undefined,
      page: 0,
      size: 20,
    },
    { skip: !!selectedDoctor || !hasDoctorSearch },
  );

  const employeeResults = employeesData?.content ?? [];
  const doctorResults = doctorsData?.content ?? [];

  const [employeeHighlight, setEmployeeHighlight] = useState(0);
  const [doctorHighlight, setDoctorHighlight] = useState(0);

  // Keep the highlighted row in range whenever the result set changes.
  useEffect(() => setEmployeeHighlight(0), [employeesData]);
  useEffect(() => setDoctorHighlight(0), [doctorsData]);

  const handleEmployeeSearchKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (employeeResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setEmployeeHighlight((i) => Math.min(i + 1, employeeResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setEmployeeHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setSelectedEmployee(employeeResults[employeeHighlight] ?? null);
    }
  };

  const handleDoctorSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (doctorResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setDoctorHighlight((i) => Math.min(i + 1, doctorResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setDoctorHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setSelectedDoctor(doctorResults[doctorHighlight] ?? null);
    }
  };

  const [createScheduledVisit, { isLoading }] =
    useCreateScheduledVisitMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  const [certificate, setCertificate] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSlotReady = async (timeSlotId: number) => {
    if (!selectedEmployee || !selectedDoctor) return;
    try {
      const visit = await createScheduledVisit({
        employeeId: selectedEmployee.employeeId,
        doctorId: selectedDoctor.id,
        timeSlotId,
      }).unwrap();

      if (certificate) {
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
          <FieldLabel>Employee</FieldLabel>
          {selectedEmployee ? (
            <SelectedPersonCard
              icon={<User className="size-4" />}
              label={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
              onChange={() => {
                setSelectedEmployee(null);
                setEmployeeNameSearch("");
                setEmployeeIdSearch("");
              }}
            />
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Search by name..."
                  value={employeeNameSearch}
                  onChange={(e) => setEmployeeNameSearch(e.target.value)}
                  onKeyDown={handleEmployeeSearchKeyDown}
                />
                <Input
                  placeholder="Search by CIN, CNSS, or ID..."
                  value={employeeIdSearch}
                  onChange={(e) => setEmployeeIdSearch(e.target.value)}
                  onKeyDown={handleEmployeeSearchKeyDown}
                />
              </div>
              {hasEmployeeSearch && (
                <PersonResultsList<EmployeeProfileResponse>
                  results={employeesData?.content}
                  emptyLabel="No matching employees."
                  getKey={(e) => e.id}
                  renderLabel={(e) => `${e.firstName} ${e.lastName}`}
                  onSelect={setSelectedEmployee}
                  highlightedIndex={employeeHighlight}
                />
              )}
            </div>
          )}
        </Field>

        <Field>
          <FieldLabel>Doctor</FieldLabel>
          {selectedDoctor ? (
            <SelectedPersonCard
              icon={<User className="size-4" />}
              label={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} — ${selectedDoctor.specialty}`}
              onChange={() => {
                setSelectedDoctor(null);
                setDoctorNameSearch("");
                setDoctorIdSearch("");
              }}
            />
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Search by name..."
                  value={doctorNameSearch}
                  onChange={(e) => setDoctorNameSearch(e.target.value)}
                  onKeyDown={handleDoctorSearchKeyDown}
                />
                <Input
                  placeholder="Search by CIN, CNSS, or ID..."
                  value={doctorIdSearch}
                  onChange={(e) => setDoctorIdSearch(e.target.value)}
                  onKeyDown={handleDoctorSearchKeyDown}
                />
              </div>
              {hasDoctorSearch && (
                <PersonResultsList<DoctorProfileResponse>
                  results={doctorsData?.content}
                  emptyLabel="No matching doctors."
                  getKey={(d) => d.id}
                  renderLabel={(d) =>
                    `Dr. ${d.firstName} ${d.lastName} — ${d.specialty}`
                  }
                  onSelect={setSelectedDoctor}
                  highlightedIndex={doctorHighlight}
                />
              )}
            </div>
          )}
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

      {selectedDoctor && selectedEmployee && (
        <SlotPicker
          doctorId={selectedDoctor.id}
          defaultVisitType="PRE_EMPLOYMENT"
          onSlotReady={handleSlotReady}
          isSubmitting={isLoading}
          submitLabel="Schedule visit"
        />
      )}

      {(!selectedDoctor || !selectedEmployee) && (
        <Button variant="outline" disabled className="w-full">
          Select an employee and a doctor to continue
        </Button>
      )}
    </div>
  );
}

interface SelectedPersonCardProps {
  icon: React.ReactNode;
  label: string;
  onChange: () => void;
}

function SelectedPersonCard({ icon, label, onChange }: SelectedPersonCardProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/10 p-3 text-sm">
      <span className="flex items-center gap-2 font-medium">
        {icon}
        {label}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground"
        onClick={onChange}
      >
        <X className="size-3.5" />
        Change
      </Button>
    </div>
  );
}

interface PersonResultsListProps<T> {
  results: T[] | undefined;
  emptyLabel: string;
  getKey: (item: T) => number;
  renderLabel: (item: T) => string;
  onSelect: (item: T) => void;
  highlightedIndex: number;
}

function PersonResultsList<T>({
  results,
  emptyLabel,
  getKey,
  renderLabel,
  onSelect,
  highlightedIndex,
}: PersonResultsListProps<T>) {
  if (!results) return null;

  if (results.length === 0) {
    return <p className="px-1 py-2 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-lg border p-1">
      {results.map((item, index) => (
        <li
          key={getKey(item)}
          ref={(el) => {
            if (index === highlightedIndex) {
              el?.scrollIntoView({ block: "nearest" });
            }
          }}
        >
          <button
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full rounded-md p-2 text-left text-sm transition-colors hover:bg-muted/50 ${
              index === highlightedIndex ? "bg-muted/60" : ""
            }`}
          >
            {renderLabel(item)}
          </button>
        </li>
      ))}
    </ul>
  );
}
