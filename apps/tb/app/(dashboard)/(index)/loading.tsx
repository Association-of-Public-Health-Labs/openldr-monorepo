"use client"
import { MainCardSkeleton } from "@repo/design_system/app/molecules/skeletons/MainCardSkeleton";
import { StatusCardSkeleton } from "@repo/design_system/app/molecules/skeletons/StatusCardSkeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-8">
        <div className="flex flex-col md:flex-row gap-8">
          {[0,1,2,3]?.map((item, index) => (
             <section key={index} className="flex-1 flex flex-col gap-6 justify-between rounded-2xl relative min-w-[220px]">
              <StatusCardSkeleton
                sx={{
                  width: "100%"
                }}
              />
            </section>
          ))}
        </div>
        <div className="@[900px]:grid-cols-2 grid gap-8">
          {[0,1,2,3]?.map((item, index) => (
            <MainCardSkeleton
              key={index}
              sx={{
                width: "100%"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}