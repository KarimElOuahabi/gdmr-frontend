import { Moon, Sun, CalendarCheck, BellRing, FileText, MessagesSquare } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const EMPLOYEE_BENEFITS = [
  {
    icon: CalendarCheck,
    title: "Request a visit in a click",
    description:
      "Ask for a spontaneous check-up or let HR schedule one for you — no paperwork, no phone calls.",
  },
  {
    icon: MessagesSquare,
    title: "Negotiate your slot",
    description:
      "Confirm a proposed date or suggest another one directly in the app until it works for everyone.",
  },
  {
    icon: FileText,
    title: "Your documents, always on hand",
    description:
      "Certificates, prescriptions, and reports from every visit, available whenever you need them.",
  },
  {
    icon: BellRing,
    title: "Never miss a reminder",
    description:
      "Real-time notifications for every step — proposed slots, confirmations, and upcoming visits.",
  },
];

export function LoginPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-svh">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="absolute right-4 top-4 z-10 rounded-full bg-background text-foreground hover:bg-background/80 hover:text-foreground"
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </Button>

      <div className="flex w-full flex-col items-center justify-center gap-6 bg-background p-6 md:w-1/2 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>

      <div className="hidden bg-primary md:flex md:w-1/2 md:flex-col md:items-center md:justify-center md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary-foreground">
              Occupational health, without the back-and-forth.
            </h2>
            <p className="text-sm text-primary-foreground/80">
              Everything employees need for their workplace medical visits, in
              one place.
            </p>
          </div>

          <ul className="space-y-6">
            {EMPLOYEE_BENEFITS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="font-semibold text-primary-foreground">
                    {title}
                  </p>
                  <p className="text-sm text-primary-foreground/70">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
