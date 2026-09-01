import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConnectorLine } from "@/components/common/ConnectorLine";

interface AppointmentRequestHeaderProps {
  doctorName?: string;
}

export function AppointmentRequestHeader({
  doctorName,
}: AppointmentRequestHeaderProps) {
  return (
    <Card className="overflow-hidden w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="text-center pb-2">
        <h2 className="text-xl font-bold">Request Appointment</h2>
      </CardHeader>

      <CardContent className="flex items-center justify-center p-8 gap-16">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-28 w-28">
            <AvatarFallback className="text-2xl font-bold">EMP</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">You</span>
        </div>

        <ConnectorLine />

        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-28 w-28">
            <AvatarFallback className="text-2xl font-bold">DR</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground">
            {doctorName ? `Dr. ${doctorName}` : "Doctor"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
