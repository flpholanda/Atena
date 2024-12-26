import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const TransactionListSkeleton = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1920px] mx-auto p-8">
        {/* Header Card Skeleton */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex flex-col gap-8">
              {/* Month selector skeleton */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full max-w-md mx-auto">
                  <Skeleton className="h-10 w-10" /> {/* Left arrow */}
                  <Skeleton className="h-10 flex-1" /> {/* Month selector */}
                  <Skeleton className="h-10 w-10" /> {/* Right arrow */}
                </div>
              </div>

              {/* Search and filter skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 max-w-4xl mx-auto w-full">
                <Skeleton className="h-11" /> {/* Search input */}
                <Skeleton className="h-11 w-28" /> {/* Filter button */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Card Skeleton */}
        <Card>
          <CardContent className="p-0">
            {/* Table Header Skeleton */}
            <div className="border-b">
              <div className="flex p-4">
                {[20, 25, 15, 15, 15, 10, 15, 5].map((width, i) => (
                  <Skeleton
                    key={i}
                    className={`h-4 mr-4`}
                    style={{ width: `${width}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="divide-y">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="flex items-center p-4">
                  <div className="flex items-center gap-3 w-[20%]">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-[25%] mr-4" />
                  <Skeleton className="h-4 w-[15%] mr-4" />
                  <Skeleton className="h-4 w-[15%] mr-4" />
                  <Skeleton className="h-4 w-[15%] mr-4" />
                  <Skeleton className="h-6 w-[10%] mr-4" />
                  <Skeleton className="h-4 w-[15%] mr-4" />
                  <Skeleton className="h-8 w-[5%]" />
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <Skeleton className="h-4 w-48" /> {/* Results count */}
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" /> {/* Previous button */}
                <Skeleton className="h-8 w-20" /> {/* Next button */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionListSkeleton;
