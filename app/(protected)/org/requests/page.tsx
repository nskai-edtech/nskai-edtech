import { Suspense } from "react";
import { getAdminCourseRequests } from "@/actions/requests/queries";
import RequestsTable from "@/components/dashboard/requests-table";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminRequestsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sessionClaims, userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    redirect("/");
  }

  const page = Number(searchParams.page) || 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;

  const result = await getAdminCourseRequests(page, 20, search);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">
            Course Requests
          </h1>
          <p className="text-secondary-text">
            Review tutor requests to take down or delete active courses.
          </p>
        </div>
      </div>

      <Suspense
        fallback={<div className="h-96 animate-pulse bg-surface rounded-xl" />}
      >
        <RequestsTable
          initialData={result.requests}
          totalCount={result.totalCount}
          totalPages={result.totalPages}
          currentPage={result.currentPage}
          searchQuery={search}
        />
      </Suspense>
    </div>
  );
}
