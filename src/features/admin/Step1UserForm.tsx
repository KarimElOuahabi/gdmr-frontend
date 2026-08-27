import * as z from "zod";
import { useForm } from "react-hook-form";
import { type Role, ALL_ROLES } from "@/types/role";
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

const userFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(ALL_ROLES),
  cin: z.string(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface Step1UserFormProps {
  onNext: (data: UserFormValues) => void;
}

export function Step1UserForm({ onNext }: Step1UserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { firstName: "", lastName: "", role: "EMPLOYEE", cin: "" },
  });

  const role = watch("role");
  const requiresNextStep =
    role === "EMPLOYEE" || role === "DOCTOR" || role === "HR";
  const onSubmit = (data: UserFormValues) => {
    onNext(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create User - Account Details</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <FieldError>{errors.firstName.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <FieldError>{errors.lastName.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="cin">
              CIN{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </FieldLabel>
            <Input id="cin" placeholder="e.g. AB123456" {...register("cin")} />
          </Field>

          <Field>
            <FieldLabel>Role</FieldLabel>
            <Select
              value={role}
              onValueChange={(v) => setValue("role", v as Role)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <DialogFooter className="mt-6 flex-col gap-2 sm:flex-col sm:items-center">
          <Button
            type="submit"
            className="bg-white text-black w-full sm:w-auto"
          >
            {requiresNextStep ? "Next: Profile Details" : "Create User"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {requiresNextStep
              ? "The user account will not be created until the profile is completed."
              : "This will immediately create the user account."}
          </p>
        </DialogFooter>
      </form>
    </>
  );
}
