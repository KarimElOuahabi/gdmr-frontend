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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const staffFormSchema = z.object({
  jobTitle: z.string(),
  phoneNumber: z.string(),
  officeLocation: z.string(),
  hireDate: z.string(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

interface UpdateStaffFormProps {
  defaultValues: StaffFormValues;
  onSubmit: (data: StaffFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UpdateStaffForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: UpdateStaffFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    values: defaultValues,
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Update Profile</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="jobTitle">Job Title</FieldLabel>
            <Input
              id="jobTitle"
              placeholder="e.g. HR Manager"
              {...register("jobTitle")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
            <Input id="phoneNumber" type="tel" {...register("phoneNumber")} />
          </Field>

          <Field>
            <FieldLabel htmlFor="officeLocation">Office Location</FieldLabel>
            <Input
              id="officeLocation"
              placeholder="e.g. HQ - 3rd floor"
              {...register("officeLocation")}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="hireDate">Hire Date</FieldLabel>
            <Input id="hireDate" type="date" {...register("hireDate")} />
          </Field>
        </FieldGroup>

        <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
