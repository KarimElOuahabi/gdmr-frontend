import { useState } from "react";
import { Link } from "react-router-dom";
import { useListVisitsQuery } from "@/features/visit/visitApi";
import { VisitCard } from "@/components/common/VisitCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, CalendarPlus, Inbox } from "lucide-react";
import { AssignTimeSlotDialog } from "@/features/visit/AssignTimeSlotDialog";
import type { VisitResponse } from "@/features/visit/visitApi";
import { EmptyState } from "@/components/common/EmptyState";

export function VisitRequestsPage() {
  const { data: requested, isLoading } = useListVisitsQuery({
    status: "REQUESTED",
    page: 0,
    size: 20,
  });

  const [visitToAssign, setVisitToAssign] = useState<VisitResponse | null>(
    null,
  );

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">New requests</h2>
            <p className="text-sm text-muted-foreground">
              Assign an available doctor slot to each request.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            render={
              <Link to="/hr/create-visit">
                <CalendarPlus className="size-4" />
                Schedule a visit
              </Link>
            }
          />
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : requested?.content.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No pending requests"
            description="New spontaneous visit requests will show up here."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {requested?.content.map((v) => (
              <VisitCard
                key={v.id}
                visit={v}
                perspective="staff"
                footer={
                  <Button
                    size="sm"
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => setVisitToAssign(v)}
                  >
                    <CalendarClock className="size-4" />
                    Assign a slot
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </section>

      <AssignTimeSlotDialog
        visit={visitToAssign}
        onOpenChange={(open) => !open && setVisitToAssign(null)}
      />
    </div>
  );
}
