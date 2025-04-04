'use client';

import {
	selectFoodSearchData,
	selectFoodSearchStatus
} from '@/lib/features/food/foodSearchSlice';
import {
	selectFoodUpdateData,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';
import { selectData, selectStatus } from '@/lib/features/log/logFoodSlice';
import { useAppSelector } from '@/lib/hooks';
import { RxFoodItem } from '@/types';
import { useEffect, useState } from 'react';

export default function ReduxStoreLogger({
	enable = true
}: {
	enable?: boolean;
}) {
	const logFoodItem = useAppSelector(selectData);
	const logFoodStatus = useAppSelector(selectStatus);

	const foodSliceData = useAppSelector(selectFoodUpdateData);
	const foodSliceStatus = useAppSelector(selectFoodUpdateStatus);

	const foodSearchData = useAppSelector(selectFoodSearchData);
	const foodSearchStatus = useAppSelector(selectFoodSearchStatus);

	const [foodSliceLog, setFoodSliceLog] = useState<
		{ item: RxFoodItem; type: string; status: string }[]
	>([]);
	useEffect(() => {
		const update = [...foodSliceLog];
		update.push({
			type: 'foodSlice',
			status: foodSliceStatus,
			item: foodSliceData
		});

		setFoodSliceLog(update);
	}, [foodSliceData, foodSliceStatus]);

	if (!enable) {
		return null;
	}

	return (
		<div className='flex flex-col gap-2 rounded-md border-2 p-4 text-xs'>
			<div>Redux store logger</div>

			{foodSliceLog.length > 0 &&
				foodSliceLog.map((item, indx) => (
					<div
						key={`${item.item.id}-${indx}-${item.status}`}
						className='rounded-md p-2 border-2 flex flex-col gap-1'>
						<div>
							{item.type} - {item.status}
						</div>
						<div>{item.item.name}</div>
					</div>
				))}
		</div>
	);
}
