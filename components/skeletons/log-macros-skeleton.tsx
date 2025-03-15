import { Skeleton } from '../ui/skeleton';

export default function LogMacrosSkeleton({
	detailedMode = false
}: {
	detailedMode?: boolean;
}) {
	return (
		<div className='flex flex-col gap-1'>
			<div className='flex flex-row flex-wrap gap-2'>
				<Skeleton className='w-44 h-4' />
				<Skeleton className='w-44 h-4' />
				<Skeleton className='w-44 h-4' />
				<Skeleton className='w-44 h-4' />
			</div>

			{detailedMode && (
				<div className='grid grid-cols-2 gap-2 text-xs'>
					<br />
					<div className='col-span-2 border-b-2 font-semibold text-lg'>
						<Skeleton className='w-44 h-2' />
					</div>
					<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
						<Skeleton className='w-44 h-2' />
						<Skeleton className='w-44 h-2' />
					</div>
					<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
						<Skeleton className='w-44 h-2' />
						<Skeleton className='w-44 h-3' />
					</div>
					<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
						<Skeleton className='w-44 h-3' />
						<Skeleton className='w-44 h-4' />
					</div>
				</div>
			)}
		</div>
	);
}
