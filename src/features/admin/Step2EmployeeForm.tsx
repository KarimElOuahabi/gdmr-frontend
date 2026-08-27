import { useEffect } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Department, ALL_DEPARTMENTS } from "@/types/department";

const employeeFormSchema = z.object({
  birthDate: z.string().min(1, "Birth date is required"),
  department: z.enum(ALL_DEPARTMENTS, {
    error: "Department is required",
  }),
  phoneNumber: z.string(),
  jobTitle: z.string(),
  hireDate: z.string(),
  cnssNumber: z.string(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface Step2EmployeeFormProps {
  onSubmit: (data: EmployeeFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<EmployeeFormValues>;
  onValuesChange?: (values: Partial<EmployeeFormValues>) => void;
}

export function Step2EmployeeForm({
  onSubmit,
  onCancel,
  defaultValues,
  onValuesChange,
}: Step2EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      birthDate: defaultValues?.birthDate ?? "",
      department: defaultValues?.department,
      phoneNumber: defaultValues?.phoneNumber ?? "",
      jobTitle: defaultValues?.jobTitle ?? "",
      hireDate: defaultValues?.hireDate ?? "",
      cnssNumber: defaultValues?.cnssNumber ?? "",
    },
  });

  // Remonte les valeurs en temps réel vers le parent, pour qu'elles survivent
  // à un "Cancel" puis "Resume" (le composant est démonté/remonté entre les deux)
  useEffect(() => {
    const subscription = watch((values) => {
      onValuesChange?.(values as Partial<EmployeeFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create User - Employee Profile</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="birthDate">Birth Date</FieldLabel>
            <Input id="birthDate" type="date" {...register("birthDate")} />
            {errors.birthDate && (
              <FieldError>{errors.birthDate.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Department</FieldLabel>
            <Select
              value={watch("department")}
              onValueChange={(v) =>
                setValue("department", v as Department, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {ALL_DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <FieldError>{errors.department.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="jobTitle">
              Job Title{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id="jobTitle"
              placeholder="e.g. Software Engineer"
              {...register("jobTitle")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phoneNumber">
              Phone Number{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input id="phoneNumber" {...register("phoneNumber")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="hireDate">
              Hire Date{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input id="hireDate" type="date" {...register("hireDate")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="cnssNumber">
              CNSS Number{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id="cnssNumber"
              placeholder="Numéro d'immatriculation CNSS"
              {...register("cnssNumber")}
            />
          </Field>
        </FieldGroup>

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-white text-black">
            Create User Account
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
