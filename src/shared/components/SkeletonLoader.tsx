import { cn } from "@/core/api/utils";

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
    return (
        <div
            className={cn(
                "animate-pulse-elegant rounded-md bg-slate-200 dark:bg-slate-800",
                className
            )}
        />
    );
};

export const CardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-border/10 space-y-4 shadow-sm">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-6 w-16" />
        </div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="flex items-center gap-6 p-6 bg-white dark:bg-slate-800 rounded-3xl animate-pulse-elegant">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-3 flex-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
        </div>
    </div>
);
