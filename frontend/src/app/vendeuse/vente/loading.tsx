import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="h-[calc(100vh-64px)] flex">
            {/* Left Panel Skeleton */}
            <div className="flex-1 p-6 space-y-6">
                <div className="flex gap-4">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="w-32 h-10 rounded-xl" />
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="w-24 h-8 rounded-full" />
                    ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-zinc-100 h-64 flex flex-col">
                            <Skeleton className="h-40 w-full rounded-t-2xl" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-6 w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel Skeleton */}
            <div className="w-105 border-l border-zinc-100 bg-white p-6 space-y-4">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <div className="space-y-4 mt-8">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
