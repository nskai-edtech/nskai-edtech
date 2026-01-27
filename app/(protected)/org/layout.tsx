import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full bg-surface-muted">
      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar role="ORG_ADMIN" />
      </div>
      <main className="md:pl-64 h-full flex flex-col">
        <div className="md:hidden h-[60px] flex items-center p-4 bg-surface border-b border-border">
          <MobileSidebar role="ORG_ADMIN" />
          <div className="font-bold text-xl text-brand ml-4">NSKAI</div>
        </div>
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
