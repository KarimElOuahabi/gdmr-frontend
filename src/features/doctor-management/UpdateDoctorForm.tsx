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
import { type Specialty, ALL_SPECIALTIES } from "@/types/specialty";

const doctorFormSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  specialty: z.enum(ALL_SPECIALTIES, {
    error: "Specialty is required",
  }),
  qualifications: z.string().min(1, "Qualifications are required"),
  yearsOfExperience: z
    .number({
      message: "Years of experience is required",
    })
    .min(0, "Must be a valid number of years"),
  workSite: z.string().min(1, "Work site is required"),
  cnssNumber: z.string(),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface UpdateDoctorFormProps {
  defaultValues: DoctorFormValues;
  onSubmit: (data: DoctorFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  showHeader?: boolean;
  showCancel?: boolean;
}

export function UpdateDoctorForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  showHeader = true,
  showCancel = true,
}: UpdateDoctorFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    // Use `values` instead of `defaultValues` so react-hook-form reactively resets
    // when props change and calculates `isDirty` correctly.
    values: defaultValues,
  });

  return (
    <>
      {showHeader && (
        <DialogHeader>
          <DialogTitle>Update Doctor</DialogTitle>
        </DialogHeader>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
            <Input id="phoneNumber" type="tel" {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <FieldError>{errors.phoneNumber.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Specialty</FieldLabel>
            <Select
              value={watch("specialty")}
              onValueChange={(v) =>
                setValue("specialty", v as Specialty, {
                  shouldValidate: true,
                  shouldDirty: true, // <-- Fix: Marks the form as dirty when selecting a specialty alone
                  shouldTouch: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a specialty" />
              </SelectTrigger>
              <SelectContent>
                {ALL_SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialty && (
              <FieldError>{errors.specialty.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="qualifications">Qualifications</FieldLabel>
            <Input
              id="qualifications"
              type="text"
              {...register("qualifications")}
            />
            {errors.qualifications && (
              <FieldError>{errors.qualifications.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="yearsOfExperience">
              Years of Experience
            </FieldLabel>
            <Input
              id="yearsOfExperience"
              type="number"
              min="0"
              {...register("yearsOfExperience", { valueAsNumber: true })}
            />
            {errors.yearsOfExperience && (
              <FieldError>{errors.yearsOfExperience.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="workSite">Work Site</FieldLabel>
            <Input id="workSite" type="text" {...register("workSite")} />
            {errors.workSite && (
              <FieldError>{errors.workSite.message}</FieldError>
            )}
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
