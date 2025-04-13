
import { cn } from "@/lib/utils";

interface SearchStatusProps {
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  statusText: string;
}

export function SearchStatus({
  currentStep,
  totalSteps,
  completedSteps,
  statusText,
}: SearchStatusProps) {
  const percentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>{currentStep}</span>
        <span>{percentage}% Complete</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{statusText}</p>
    </div>
  );
}
