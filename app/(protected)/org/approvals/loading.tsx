import { Loader2 } from "lucide-react";

export default function ApprovalsLoading() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
      <p className="text-secondary-text font-medium">
        Loading approval data...
      </p>
    </div>
  );
}
