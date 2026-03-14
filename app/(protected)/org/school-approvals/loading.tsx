import { Loader2 } from "lucide-react";

export default function SchoolApprovalsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-surface-muted rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-surface-muted rounded-lg animate-pulse mt-2" />
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="h-8 w-8 text-brand animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading pending school approvals...
        </p>
      </div>
    </div>
  );
}
