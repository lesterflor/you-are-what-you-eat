'use client';

import {
	selectPreparedDishData,
	selectPreparedDishStatus
} from '@/lib/features/dish/preparedDishSlice';
import { useAppSelector } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { Soup } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import CreateDishForm from './create-dish-form';

export default function DishCreationPopover() {
	const [createDishSheetOpen, setCreateDishSheetOpen] = useState(false);
	const [dishCreationIndicator, setDishCreationIndicator] = useState(false);
	const [dishList, setDishList] = useState<
		{ add: boolean; item: GetFoodEntry }[]
	>([]);

	const preparedDishData = useAppSelector(selectPreparedDishData);
	const preparedDishStatus = useAppSelector(selectPreparedDishStatus);

	useEffect(() => {
		if (
			preparedDishStatus === 'added' ||
			preparedDishStatus === 'cleared' ||
			preparedDishStatus === 'updated'
		) {
			setDishList([]);
			setCreateDishSheetOpen(false);
		} else if (
			preparedDishStatus === 'dishList' ||
			preparedDishStatus === 'checkedItem'
		) {
			const newData = JSON.parse(preparedDishData.dishList);
			setDishList(newData);
		}
	}, [preparedDishData, preparedDishStatus]);

	useEffect(() => {
		setDishCreationIndicator(dishList.length > 0);

		if (dishList.length < 1) {
			setCreateDishSheetOpen(false);
		}
	}, [dishList]);

	return (
		<Popover
			modal={true}
			open={createDishSheetOpen}
			onOpenChange={setCreateDishSheetOpen}>
			<PopoverTrigger disabled={!dishCreationIndicator}>
				<div
					className={cn(
						'p-1 rounded-full',
						dishCreationIndicator
							? 'animate-ping bg-fuchsia-500'
							: 'bg-gray-700'
					)}>
					<Soup
						className={cn(
							'w-4 h-4',
							dishCreationIndicator ? 'opacity-100' : 'opacity-20'
						)}
					/>
				</div>
			</PopoverTrigger>
			<PopoverContent className='bg-emerald-950 relative max-w-[95vw] w-[90vw] py-2 px-2'>
				<CreateDishForm
					foodItems={dishList.map((item) => item.item)}
					onSuccess={() => {
						setCreateDishSheetOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
