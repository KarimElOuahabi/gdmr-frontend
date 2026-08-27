import { useState, useEffect } from "react";
import { type CreateUserRequest, useCreateUserMutation } from "./adminUsersApi";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Step1UserForm, type UserFormValues } from "./Step1UserForm";
import {
  Step2EmployeeForm,
  type EmployeeFormValues,
} from "./Step2EmployeeForm";
// 1. Import Step2DoctorForm and its types
import { Step2DoctorForm, type DoctorFormValues } from "./Step2DoctorForm";
import { Step2StaffForm, type StaffFormValues } from "./Step2StaffForm";
import { toast } from "@/components/ui/toast";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { doctorManagementApi } from "@/features/doctor-management/doctorManagementApi";
import { employeeManagementApi } from "@/features/employee-management/employeeManagementApi";
import { useAppDispatch } from "@/app/hooks";

interface CreateUserWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (temporaryPassword: string) => void;
}

export function CreateUserWizardModal({
  open,
  onOpenChange,
  onCreated,
}: CreateUserWizardModalProps) {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [draftData, setDraftData] = useState<UserFormValues | null>(null);
  const [employeeDraft, setEmployeeDraft] =
    useState<Partial<EmployeeFormValues> | null>(null);
  // 2. Add state for doctor draft
  const [doctorDraft, setDoctorDraft] =
    useState<Partial<DoctorFormValues> | null>(null);
  const [staffDraft, setStaffDraft] =
    useState<Partial<StaffFormValues> | null>(null);

  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [createUser] = useCreateUserMutation();

  useEffect(() => {
    if (open) {
      setStep(1);
      setDraftData(null);
      setEmployeeDraft(null);
      setDoctorDraft(null); // Reset doctor draft state
      setStaffDraft(null);
      setShowCancelAlert(false);
    }
  }, [open]);

  const handleClose = () => {
    setShowCancelAlert(false);
    onOpenChange(false);
  };

  const createImmediately = async (payload: CreateUserRequest) => {
    try {
      const result = await createUser(payload).unwrap();
      if (payload.role === "DOCTOR") {
        dispatch(
          doctorManagementApi.util.invalidateTags([
            { type: "Doctor", id: "LIST" },
          ]),
        );
      } else if (payload.role === "EMPLOYEE") {
        dispatch(
          employeeManagementApi.util.invalidateTags([
            { type: "Employee", id: "LIST" },
          ]),
        );
      }
      if (result?.temporaryPassword && onCreated) {
        onCreated(result.temporaryPassword);
      }
      handleClose();
    } catch (err) {
      toast.add({
        title: "Error",
        description: "Failed to create user account.",
      });
    }
  };

  const handleStep1Complete = async (step1Data: UserFormValues) => {
    // 3. Branching: If Employee OR Doctor, move to Step 2
    if (
      step1Data.role === "EMPLOYEE" ||
      step1Data.role === "DOCTOR" ||
      step1Data.role === "HR"
    ) {
      setDraftData(step1Data);
      setStep(2);
      return;
    }

    await createImmediately({
      firstName: step1Data.firstName,
      lastName: step1Data.lastName,
      role: step1Data.role,
      cin: step1Data.cin || null,
    });
  };

  const handleStepCancel = () => {
    setShowCancelAlert(true);
  };

  const handleStep2EmployeeComplete = async (step2Data: EmployeeFormValues) => {
    if (!draftData) return;

    await createImmediately({
      firstName: draftData.firstName,
      lastName: draftData.lastName,
      role: draftData.role,
      cin: draftData.cin || null,
      employeeInfo: {
        birthDate: step2Data.birthDate,
        department: step2Data.department,
        phoneNumber: step2Data.phoneNumber || null,
        jobTitle: step2Data.jobTitle || null,
        hireDate: step2Data.hireDate || null,
        cnssNumber: step2Data.cnssNumber || null,
      },
    });
  };

  // 4. Handler for completing Doctor step 2
  const handleStep2DoctorComplete = async (step2Data: DoctorFormValues) => {
    if (!draftData) return;

    await createImmediately({
      firstName: draftData.firstName,
      lastName: draftData.lastName,
      role: draftData.role,
      cin: draftData.cin || null,
      doctorInfo: {
        phoneNumber: step2Data.phoneNumber,
        specialty: step2Data.specialty,
        qualifications: step2Data.qualifications,
        yearsOfExperience: step2Data.yearsOfExperience,
        workSite: step2Data.workSite,
        cnssNumber: step2Data.cnssNumber || null,
      },
    });
  };

  const handleStep2StaffComplete = async (step2Data: StaffFormValues) => {
    if (!draftData) return;

    await createImmediately({
      firstName: draftData.firstName,
      lastName: draftData.lastName,
      role: draftData.role,
      cin: draftData.cin || null,
      staffInfo: {
        phoneNumber: step2Data.phoneNumber || null,
        jobTitle: step2Data.jobTitle || null,
        hireDate: step2Data.hireDate || null,
        officeLocation: step2Data.officeLocation || null,
      },
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            if (step === 2) {
              handleStepCancel();
            } else {
              handleClose();
            }
          }
        }}
      >
        <DialogContent>
          {step === 1 && <Step1UserForm onNext={handleStep1Complete} />}

          {/* 5. Conditionally render Employee or Doctor form on Step 2 */}
          {step === 2 && draftData?.role === "EMPLOYEE" && (
            <Step2EmployeeForm
              onSubmit={handleStep2EmployeeComplete}
              onCancel={handleStepCancel}
              defaultValues={employeeDraft ?? undefined}
              onValuesChange={setEmployeeDraft}
            />
          )}

          {step === 2 && draftData?.role === "DOCTOR" && (
            <Step2DoctorForm
              onSubmit={handleStep2DoctorComplete}
              onCancel={handleStepCancel}
              defaultValues={doctorDraft ?? undefined}
              onValuesChange={setDoctorDraft}
            />
          )}

          {step === 2 && draftData?.role === "HR" && (
            <Step2StaffForm
              onSubmit={handleStep2StaffComplete}
              onCancel={handleStepCancel}
              defaultValues={staffDraft ?? undefined}
              onValuesChange={setStaffDraft}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to cancel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All unsaved data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelAlert(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClose}>
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
