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
// You may need to adjust this import based on your exact file structure
import { type Specialty, ALL_SPECIALTIES } from "@/types/specialty";

const doctorFormSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  specialty: z.enum(ALL_SPECIALTIES, {
    message: "Specialty is required",
  }),
  qualifications: z.string().min(1, "Qualifications are required"),
  yearsOfExperience: z
    .number({ message: "Years of experience is required" })
    .min(0, "Must be a valid number of years"),
  workSite: z.string().min(1, "Work site is required"),
  cnssNumber: z.string(),
});

export type DoctorFormValues = z.infer<typeof doctorFormSchema>;

interface Step2DoctorFormProps {
  onSubmit: (data: DoctorFormValues) => void;
  onCancel: () => void;
  defaultValues?: Partial<DoctorFormValues>;
  onValuesChange?: (values: Partial<DoctorFormValues>) => void;
}

export function Step2DoctorForm({
  onSubmit,
  onCancel,
  defaultValues,
  onValuesChange,
}: Step2DoctorFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      phoneNumber: defaultValues?.phoneNumber ?? "",
      specialty: defaultValues?.specialty,
      qualifications: defaultValues?.qualifications ?? "",
      yearsOfExperience: defaultValues?.yearsOfExperience,
      workSite: defaultValues?.workSite ?? "",
      cnssNumber: defaultValues?.cnssNumber ?? "",
    },
  });

  // Remonte les valeurs en temps réel vers le parent, pour qu'elles survivent
  // à un "Cancel" puis "Resume" (le composant est démonté/remonté entre les deux)
  useEffect(() => {
    const subscription = watch((values) => {
      onValuesChange?.(values as Partial<DoctorFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create User - Doctor Profile</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
            <Input id="phoneNumber" type="text" {...register("phoneNumber")} />
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
