'use client';

import { getCurrentLogQueryOptions } from '@/lib/queries/logQueries';
import { formatUnit } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function ExpendedBadge() {
	const { data: currentLogData } = useQuery(getCurrentLogQueryOptions());

	return (
		<>
			{currentLogData && currentLogData?.macros.caloriesBurned > 0 && (
				<div className='transition-opacity fade-in animate-in duration-1000 p-1 rounded-md border-2 font-normal text-xs flex flex-col gap-0 items-center w-16'>
					<span>Expended</span>
					<span>{formatUnit(currentLogData.macros.caloriesBurned)}</span>
				</div>
			)}
		</>
	);
}
