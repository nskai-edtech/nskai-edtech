import { Shield, School as SchoolIcon } from "lucide-react";
import { getApprovedSchools } from "@/actions/admin/schools";
import { ApprovedSchoolsList } from "./_components/approved-schools-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registered Schools | Admin Dashboard",
  description: "Manage registered schools on the Zerra platform.",
};

export default async function SchoolsPage() {
  const res = await getApprovedSchools();

  if (res.error) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error: {res.error}
        </div>
      </div>
    );
  }

  // Ensure we have an array to work with
  const schools = res.schools || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-primary-text">
            <SchoolIcon className="w-7 h-7 md:w-8 md:h-8 text-brand" />
            Registered Schools
          </h1>
          <p className="text-secondary-text mt-2">
            View and manage all approved schools on the platform.
          </p>
        </div>
        
        {/* Total Stat Pill */}
        <div className="bg-surface border border-border px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-lg">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-secondary-text font-medium">Total Active</p>
            <p className="text-lg font-bold text-primary-text leading-none mt-0.5">{schools.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content List */}
      <ApprovedSchoolsList schools={schools} />
    </div>
  );
}
