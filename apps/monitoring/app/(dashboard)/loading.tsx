"use client"
import { MainCardSkeleton } from "@repo/design_system/app/molecules/skeletons/MainCardSkeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-6">
        <div className="@[840px]:grid-cols-2 grid gap-6">
          {[0,1,2,3]?.map((item, index) => (
            <MainCardSkeleton
              key={index}
              sx={{
                height: "400px",
                width: "100%"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}