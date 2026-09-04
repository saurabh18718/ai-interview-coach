import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", variant = "rect" }) => {
  const base = "animate-pulse bg-neutral-200 dark:bg-neutral-800";
  const rounded = variant === "circle" ? "rounded-full" : variant === "text" ? "rounded" : "rounded-lg";

  return <div className={`${base} ${rounded} ${className}`} />;
};

export const CardSkeleton: React.FC = () => (
  <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-8" variant="circle" />
    </div>
    <Skeleton className="h-8 w-20" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

export const InterviewCardSkeleton: React.FC = () => (
  <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-32" />
    <div className="flex gap-2">
      <Skeleton className="h-5 w-20 rounded-md" />
      <Skeleton className="h-5 w-24 rounded-md" />
    </div>
  </div>
);
