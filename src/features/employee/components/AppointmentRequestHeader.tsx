import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ConnectorLine } from "@/components/common/ConnectorLine";

interface AppointmentRequestHeaderProps {
  employeeUserId?: number;
  employeeFirstName?: string;
  employeeLastName?: string;
  doctorUserId?: number;
  doctorFirstName?: string;
  doctorLastName?: string;
}

export function AppointmentRequestHeader({
  employeeUserId,
  employeeFirstName = "",
  employeeLastName = "",
  doctorUserId,
  doctorFirstName = "",
  doctorLastName = "",
}: AppointmentRequestHeaderProps) {
  const doctorName = doctorFirstName || doctorLastName
    ? `Dr. ${doctorFirstName} ${doctorLastName}`.trim()
    : "Doctor";

  return (
    <Card className="overflow-hidden w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="text-center pb-2">
        <h2 className="text-xl font-bold">Request Appointment</h2>
      </CardHeader>

      <CardContent className="flex items-center justify-center gap-4 p-4 sm:gap-16 sm:p-8">
        <div className="flex min-w-0 flex-col items-center gap-2">
          <UserAvatar
            userId={employeeUserId}
            role="EMPLOYEE"
            firstName={employeeFirstName}
            lastName={employeeLastName}
            className="h-16 w-16 sm:h-28 sm:w-28"
            iconClassName="h-6 w-6 sm:h-10 sm:w-10"
          />
          <span className="max-w-24 truncate text-sm font-medium text-muted-foreground sm:max-w-none">
            You
          </span>
        </div>

        <ConnectorLine />

        <div className="flex min-w-0 flex-col items-center gap-2">
          <UserAvatar
            userId={doctorUserId}
            role="DOCTOR"
            firstName={doctorFirstName}
            lastName={doctorLastName}
            className="h-16 w-16 sm:h-28 sm:w-28"
            iconClassName="h-6 w-6 sm:h-10 sm:w-10"
          />
          <span className="max-w-24 truncate text-sm font-medium text-muted-foreground sm:max-w-none">
            {doctorName}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
