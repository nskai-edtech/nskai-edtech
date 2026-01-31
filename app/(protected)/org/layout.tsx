import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { getAdminPendingCounts } from "@/actions/admin";

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const counts = await getAdminPendingCounts();

  return (
    <div className="h-full bg-surface-muted" suppressHydrationWarning>
      <div className="hidden xl:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar role="ORG_ADMIN" counts={counts} />
      </div>
      <main className="xl:pl-64 h-full flex flex-col">
        <div className="xl:hidden h-[60px] flex items-center p-4 bg-surface border-b border-border sticky top-0 z-50">
          <MobileSidebar role="ORG_ADMIN" counts={counts} />
          <div className="font-bold text-xl text-brand ml-4">NSKAI</div>
        </div>
        <div className="flex-1 p-4" suppressHydrationWarning>
          {children}
        </div>
      </main>
    </div>
  );
}
