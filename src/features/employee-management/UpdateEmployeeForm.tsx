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

interface UpdateEmployeeFormProps {
  defaultValues: EmployeeFormValues;
  onSubmit: (data: EmployeeFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  showHeader?: boolean;
  showCancel?: boolean;
}

export function UpdateEmployeeForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  showHeader = true,
  showCancel = true,
}: UpdateEmployeeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    // Use `values` instead of `defaultValues` so react-hook-form reactively resets
    // when props change and calculates `isDirty` correctly.
    values: defaultValues,
  });

  return (
    <>
      {showHeader && (
        <DialogHeader>
          <DialogTitle>Update Employee</DialogTitle>
        </DialogHeader>
      )}

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
                  shouldDirty: true, // <-- Fix: Marks the form as dirty when selecting a department alone
                  shouldTouch: true,
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
          {showCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
