'use client';

import { getAllDishes } from '@/actions/prepared-dish-actions';
import {
	selectPreparedDishData,
	selectPreparedDishStatus
} from '@/lib/features/dish/preparedDishSlice';
import { useAppSelector } from '@/lib/hooks';
import { GetPreparedDish } from '@/types';
import { CookingPot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { ScrollArea } from '../ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import DishCard from './dish-card';

export default function DishListSheet() {
	const [dishes, setDishes] = useState<GetPreparedDish[]>();
	const [fetchingDishes, setFetchingDishes] = useState(false);

	const dishStateData = useAppSelector(selectPreparedDishData);
	const dishStateStatus = useAppSelector(selectPreparedDishStatus);

	useEffect(() => {
		if (
			dishStateStatus === 'added' ||
			dishStateStatus === 'updated' ||
			dishStateStatus === 'deleted'
		) {
			getDishes();
		}
	}, [dishStateData, dishStateStatus]);

	const getDishes = async () => {
		setFetchingDishes(true);
		const res = await getAllDishes();

		if (res.success) {
			setDishes(res.data as GetPreparedDish[]);
		}

		setFetchingDishes(false);
	};

	useEffect(() => {
		getDishes();
	}, []);

	return (
		<>
			<Sheet>
				<SheetTrigger asChild>
					<div className='rounded-full w-12 h-12 bg-slate-500 p-2 flex flex-col items-center justify-center'>
						<CookingPot className='w-6 h-6' />
					</div>
				</SheetTrigger>
				<SheetContent
					side={'left'}
					className='max-w-[100vw] w-96 px-2'>
					<SheetTitle className='flex flex-row items-center gap-2'>
						{' '}
						<CookingPot className='w-6 h-6' /> Your Dishes
					</SheetTitle>
					<SheetDescription className='text-sm leading-tight pb-3'>
						These are your prepared dishes. You can create dishes by selecting
						items from your logged food list. You can then log all items from a
						dish instead of adding food items individually.
					</SheetDescription>
					{fetchingDishes ? (
						<ImSpinner2 className='animate-spin w-8 h-8' />
					) : (
						<>
							<ScrollArea className='w-full pr-3'>
								<div className='flex flex-col gap-4 max-h-[70vh]'>
									{dishes && dishes.length > 0 ? (
										dishes.map((item) => (
											<DishCard
												key={item.id}
												dish={item}
											/>
										))
									) : (
										<div>No dishes</div>
									)}
								</div>
							</ScrollArea>
						</>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
