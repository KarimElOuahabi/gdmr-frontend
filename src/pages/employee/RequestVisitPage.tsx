import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/toast";
import { useRequestSpontaneousVisitMutation } from "@/features/visit/visitApi";
import { useListDoctorsQuery } from "@/features/doctor-management/doctorManagementApi";
import { useGetEmployeeProfileQuery } from "@/features/employee/employeeApi";
import { useUploadDocumentMutation } from "@/features/document/documentApi";
import {
  AppointmentRequestForm,
  type AppointmentRequestSubmitPayload,
} from "@/features/employee/components/AppointmentRequestForm";
import { AppointmentRequestHeader } from "@/features/employee/components/AppointmentRequestHeader";

export function RequestVisitPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [requestVisit, { isLoading }] = useRequestSpontaneousVisitMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  const { data: doctorsData } = useListDoctorsQuery({ page: 0, size: 100 });
  const doctor = doctorsData?.content.find(
    (d) => d.userId === Number(doctorId),
  );
  const { data: employeeProfile } = useGetEmployeeProfileQuery();

  const onSubmitRequest = async ({
    proposedSlots,
    reason,
    attachment,
  }: AppointmentRequestSubmitPayload) => {
    if (!doctorId) return;
    try {
      const visit = await requestVisit({
        doctorUserId: Number(doctorId),
        motif: reason,
        proposedSlots,
      }).unwrap();

      if (attachment) {
        try {
          await uploadDocument({
            documentType: "FITNESS_CERTIFICATE",
            file: attachment,
            visitId: visit.id,
          }).unwrap();
        } catch {
          toast.add({
            title: "Request sent, but attachment failed",
            description:
              "Your visit request was sent. You can retry the attachment from your documents page.",
          });
          navigate("/employee/appointments");
          return;
        }
      }

      toast.add({
        title: "Request sent",
        description: "HR will process your request shortly.",
      });
      navigate("/employee/appointments");
    } catch {
      toast.add({
        title: "Error",
        description: "Failed to send your visit request.",
      });
    }
  };

  return (
    <div>
      <AppointmentRequestHeader
        employeeUserId={employeeProfile?.id}
        employeeFirstName={employeeProfile?.firstName}
        employeeLastName={employeeProfile?.lastName}
        doctorUserId={doctor?.userId}
        doctorFirstName={doctor?.firstName}
        doctorLastName={doctor?.lastName}
      />
      <AppointmentRequestForm
        onSubmitRequest={onSubmitRequest}
        isSubmitting={isLoading}
        submitLabel="Send Request"
      />
    </div>
  );
}
