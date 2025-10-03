'use client';

import { getTimeQueryOptions } from '@/lib/queries/generalQueries';
import { getToday } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

export default function CurrentDayHud() {
	const { data = format(getToday().current, 'eee PP h:mm a') } = useQuery(
		getTimeQueryOptions()
	);

	return (
		<div className='flex flex-row items-center gap-2'>
			<Calendar className='w-4 h-4' />
			<div>{data}</div>
		</div>
	);
}
