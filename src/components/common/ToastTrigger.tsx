"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface ToastTriggerProps {
  message?: string;
  description?: string;
  triggerText?: string;
}

export function ToastTrigger({
  message,
  description,
  triggerText,
}: ToastTriggerProps) {
  function showToast() {
    const id = toast.add({
      title: message,
      description: description,
      actionProps: {
        children: "Undo",
        onClick() {
          toast.close(id);
        },
      },
    });
  }

  return (
    <Button variant="outline" onClick={showToast}>
      {triggerText}
    </Button>
  );
}
