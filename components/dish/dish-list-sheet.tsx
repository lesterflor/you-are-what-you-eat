'use client';

import { getAllDishes } from '@/actions/prepared-dish-actions';
import {
	selectPreparedDishData,
	selectPreparedDishStatus
} from '@/lib/features/dish/preparedDishSlice';
import { useAppSelector } from '@/lib/hooks';
import { getStorageItem, setStorageItem } from '@/lib/utils';
import { GetPreparedDish } from '@/types';
import { Soup } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { TbBowl } from 'react-icons/tb';
import { ScrollArea } from '../ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import DishCard from './dish-card';

export default function DishListSheet({
	children,
	showBalloon = false
}: {
	children: React.ReactNode;
	showBalloon?: boolean;
}) {
	const [dishes, setDishes] = useState<GetPreparedDish[]>();
	const [fetchingDishes, setFetchingDishes] = useTransition();
	const [sheetOpen, setSheetOpen] = useState(false);

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

	const getDishes = useCallback(() => {
		setFetchingDishes(async () => {
			const res = await getAllDishes();

			if (res.success) {
				setFetchingDishes(() => {
					setDishes(res.data as GetPreparedDish[]);
					setStorageItem('preparedDishes', res.data);
				});
			}
		});
	}, [dishes]);

	useEffect(() => {
		// on mount get all foods and do local sorting in redux handler
		const savedDishes: GetPreparedDish[] =
			getStorageItem('preparedDishes') || [];

		if (savedDishes.length > 0) {
			setDishes(savedDishes);
		} else {
			getDishes();
		}
	}, []);

	return (
		<>
			<Sheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}>
				<SheetTrigger asChild>
					<div className='relative'>
						{children}
						{showBalloon && dishes && dishes?.length > 0 && (
							<div className='absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center'>
								{dishes?.length}
							</div>
						)}
					</div>
				</SheetTrigger>
				<SheetContent
					side={'bottom'}
					className='max-w-[100vw] w-96 px-2'>
					<SheetTitle className='flex flex-row items-center gap-2 w-48'>
						{' '}
						<Soup className='w-6 h-6 text-fuchsia-500' /> Your Dishes
					</SheetTitle>
					<SheetDescription className='text-sm leading-tight pb-6'>
						These are your prepared dishes. You can create dishes by selecting
						items from your logged food list or add them from searched food
						items. You can then log all items from a dish instead of adding food
						items individually.
					</SheetDescription>

					<ScrollArea className='w-full pr-3 h-[70vh]'>
						{fetchingDishes ? (
							<ImSpinner2 className='animate-spin w-8 h-8 opacity-25' />
						) : (
							<div className='flex flex-col gap-6'>
								{dishes && dishes.length > 0 ? (
									dishes.map((item) => (
										<DishCard
											key={item.id}
											dish={item}
											onLogged={() => setSheetOpen(false)}
										/>
									))
								) : (
									<div className='pt-10 flex flex-col items-center justify-center w-full opacity-20'>
										<TbBowl className=' w-24 h-24' />
										<div>You currently have no dishes</div>
									</div>
								)}
							</div>
						)}
					</ScrollArea>
				</SheetContent>
			</Sheet>
		</>
	);
}
