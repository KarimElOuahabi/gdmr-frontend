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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const staffFormSchema = z.object({
  phoneNumber: z.string(),
  jobTitle: z.string(),
  hireDate: z.string(),
  officeLocation: z.string(),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

interface Step2StaffFormProps {
  onSubmit: (data: StaffFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<StaffFormValues>;
  onValuesChange?: (values: Partial<StaffFormValues>) => void;
}

export function Step2StaffForm({
  onSubmit,
  onCancel,
  defaultValues,
  onValuesChange,
}: Step2StaffFormProps) {
  const {
    register,
    handleSubmit,
    watch,
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      phoneNumber: defaultValues?.phoneNumber ?? "",
      jobTitle: defaultValues?.jobTitle ?? "",
      hireDate: defaultValues?.hireDate ?? "",
      officeLocation: defaultValues?.officeLocation ?? "",
    },
  });

  useEffect(() => {
    const subscription = watch((values) => {
      onValuesChange?.(values as Partial<StaffFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create User - HR Profile</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="jobTitle">
              Job Title{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id="jobTitle"
              placeholder="e.g. HR Manager"
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
            <FieldLabel htmlFor="officeLocation">
              Office Location{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input
              id="officeLocation"
              placeholder="e.g. HQ - 3rd floor"
              {...register("officeLocation")}
            />
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
