import { Skeleton } from "@/components/ui/shadcn/skeleton";

export const ChatLoadingSkeleton = () => {
	return (
		<div className="flex flex-col gap-2 mt-2">
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-4 w-1/2" />
			<Skeleton className="h-4 w-5/6" />
		</div>
	);
};
