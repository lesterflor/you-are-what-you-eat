'use client';

import { getCurrentLogQueryOptions } from '@/lib/queries/logQueries';
import { formatUnit } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function BMRBadge() {
	const { data: bmrData } = useQuery(getCurrentLogQueryOptions());

	return (
		<div className='h-11'>
			{bmrData && bmrData.macros.bmr > 0 && (
				<div className='transition-opacity fade-in animate-in duration-1000 p-1 rounded-md border-2 items-center font-normal text-xs flex flex-col gap-0 w-16'>
					<span>BMR</span>
					<span>{formatUnit(bmrData.macros.bmr)}</span>
				</div>
			)}
		</div>
	);
}
