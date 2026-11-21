import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailsLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-5 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <Skeleton className="h-4 w-64 max-w-full" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.95fr)]">

          <div className="space-y-6">

            {/* Hero image */}
            <Skeleton className="aspect-[16/9] w-full rounded-xl" />

            {/* Title and price */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-9 w-3/4 max-w-full" />
                <Skeleton className="h-10 w-40" />
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>

            {/* Service details */}
            <Skeleton className="h-28 w-full rounded-xl" />

            {/* Technician */}
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-6 w-48" />

                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 shrink-0 rounded-full" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56 max-w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Reserved booking column */}
          <div className="hidden lg:block" />

        </div>
      </div>
    </main>
  );
}