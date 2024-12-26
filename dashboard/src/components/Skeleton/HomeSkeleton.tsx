import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const HomeSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Info Cards Container */}
      <div className="flex gap-4">
        <div className="flex gap-2 flex-1">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex-1">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credit Card Skeleton */}
        <Card className="w-1/4">
          <CardContent className="p-4">
            <Skeleton className="h-[140px] w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Content Area */}
      <div className="flex gap-4">
        {/* Main Content */}
        <Card className="w-3/4">
          <CardContent className="p-4">
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>

        {/* Last Transactions */}
        <Card className="w-1/4">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-28" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeSkeleton;
