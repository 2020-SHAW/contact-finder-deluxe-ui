
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
    <div className="w-full space-y-3">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{currentStep}</span>
        <span>{percentage}% Complete</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-sm text-muted-foreground animate-pulse">{statusText}</p>
    </div>
  );
}
