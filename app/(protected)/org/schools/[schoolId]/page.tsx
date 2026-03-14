import { getSchoolDetails } from "@/actions/admin/school-details";
import { notFound } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  CreditCard, 
  User, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = await params;
  const res = await getSchoolDetails(schoolId);
  return {
    title: res.school ? `${res.school.name} | School Details` : "School Details",
  };
}

export default async function SchoolDetailsPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const data = await getSchoolDetails(schoolId);

  if (data.error || !data.school) {
    return notFound();
  }

  const { school, location, financial, adminUser } = data;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Top Banner & Back Link */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/org/schools" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schools
        </Link>
        
        {/* Hero Section */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div 
            className="h-32 w-full"
            style={{ backgroundColor: school.primaryColor || "#3b82f6" }}
          />
          <div className="px-6 pb-6 relative flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12">
            <div 
              className="h-24 w-24 rounded-2xl ring-4 ring-surface flex items-center justify-center text-3xl font-bold text-white shadow-md bg-white shrink-0"
              style={{ backgroundColor: school.primaryColor || "#3b82f6" }}
            >
              {school.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-primary-text truncate">
                  {school.name}
                </h1>
                <span className="inline-flex items-center rounded-md bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Active
                </span>
              </div>
              {school.motto && (
                <p className="text-sm text-secondary-text italic mt-1">&quot;{school.motto}&quot;</p>
              )}
            </div>
            
            <div className="flex-col hidden sm:flex items-end text-sm text-muted-foreground">
              <span>Registered</span>
              <span className="font-medium text-foreground">{new Date(school.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Identity & Contact */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Identity Block */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
              <Building2 className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-semibold text-primary-text">Institution Details</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <DetailItem label="School Type" value={school.schoolType} />
              <DetailItem label="Curriculum" value={school.curriculumType || "Not specified"} />
              <DetailItem label="Established" value={school.yearEstablished?.toString() || "Unknown"} />
              <div className="sm:col-span-2 mt-2">
                <p className="text-sm text-muted-foreground mb-2">Education Levels</p>
                <div className="flex flex-wrap gap-2">
                  {(school.educationLevels as string[])?.map((lvl) => (
                    <span key={lvl} className="inline-flex items-center rounded-md border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-foreground">
                      {lvl}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Contact Block */}
          {location && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
                <MapPin className="w-5 h-5 text-brand" />
                <h2 className="text-lg font-semibold text-primary-text">Location & Contact</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="sm:col-span-2">
                  <DetailItem label="Full Address" value={location.fullAddress} />
                </div>
                <DetailItem label="Country" value={location.country} />
                <DetailItem label="State/Province" value={`${location.lga}, ${location.state}`} />
                <DetailItem 
                  label="Official Email" 
                  value={location.email} 
                  icon={<Mail className="w-3.5 h-3.5" />}
                />
                <DetailItem 
                  label="Reception Phone" 
                  value={location.receptionPhone} 
                  icon={<Phone className="w-3.5 h-3.5" />}
                />
                {location.website && (
                  <DetailItem 
                    label="Website" 
                    value={location.website} 
                    icon={<Globe className="w-3.5 h-3.5" />}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: People & Financials */}
        <div className="space-y-6">
          
          {/* Ownership Block */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
              <User className="w-5 h-5 text-brand" />
              <h2 className="text-lg font-semibold text-primary-text">Ownership</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Proprietor</p>
                <p className="font-medium text-sm text-primary-text">{school.proprietorName}</p>
                <p className="text-sm text-muted-foreground">{school.proprietorEmail}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Owner / CEO</p>
                <p className="font-medium text-sm text-primary-text">{school.ownerName}</p>
                <p className="text-sm text-muted-foreground">{school.ownerEmail}</p>
              </div>
              {adminUser && (
                <div className="pt-4 border-t border-border mt-4">
                  <p className="text-xs text-brand uppercase tracking-wider font-semibold mb-1">System Admin Appointed</p>
                  <p className="font-medium text-sm text-primary-text">{adminUser.firstName} {adminUser.lastName}</p>
                  <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financials Block */}
          {financial && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
                <Briefcase className="w-5 h-5 text-brand" />
                <h2 className="text-lg font-semibold text-primary-text">Compliance</h2>
              </div>
              
              <div className="space-y-3">
                <DetailItem label="CAC Registration" value={financial.cacRegistrationNumber || "N/A"} />
                <DetailItem label="Tax ID (TIN)" value={financial.tin || "N/A"} />
                
                <div className="pt-4 mt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 mb-3 text-muted-foreground">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm font-medium">Payout Bank Details</span>
                  </div>
                  <DetailItem label="Bank Name" value={financial.settlementBankName || "N/A"} />
                  <DetailItem label="Account Name" value={financial.accountName || "N/A"} />
                  <DetailItem label="Account Number" value={financial.accountNumber || "N/A"} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-1.5 font-medium text-primary-text text-sm">
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}
