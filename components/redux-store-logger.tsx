'use client';

import { selectData, selectStatus } from '@/lib/features/log/logFoodSlice';
import { useAppSelector } from '@/lib/hooks';
import { format } from 'date-fns';

export default function ReduxStoreLogger({
	enable = true
}: {
	enable?: boolean;
}) {
	const foodItem = useAppSelector(selectData);
	const status = useAppSelector(selectStatus);

	if (!enable) {
		return null;
	}

	return (
		<div className='flex flex-col gap-2 rounded-md border-2 p-4 text-xs'>
			<div>Redux store logger</div>
			<div>
				{foodItem.servings} {foodItem.name}
			</div>
			<div>
				{foodItem.time && format(new Date(Number(foodItem.time)), 'PPP h:mm a')}
			</div>
			<div>{status}</div>
		</div>
	);
}
