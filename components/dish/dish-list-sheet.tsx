'use client';

import { getAllDishes } from '@/actions/prepared-dish-actions';
import {
	selectPreparedDishData,
	selectPreparedDishStatus
} from '@/lib/features/dish/preparedDishSlice';
import { useAppSelector } from '@/lib/hooks';
import { GetPreparedDish } from '@/types';
import { Soup } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { TbBowl } from 'react-icons/tb';
import { useInView } from 'react-intersection-observer';
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
	children
}: {
	children: React.ReactNode;
}) {
	const [dishes, setDishes] = useState<GetPreparedDish[]>();
	const [fetchingDishes, setFetchingDishes] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [ref, inView] = useInView();

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

	const getDishes = useCallback(async () => {
		setFetchingDishes(true);
		const res = await getAllDishes();

		if (res.success) {
			setDishes(res.data as GetPreparedDish[]);
		}

		setFetchingDishes(false);
	}, [dishes]);

	useEffect(() => {
		if (inView) {
			getDishes();
		}
	}, [inView]);

	return (
		<>
			<Sheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}>
				<SheetTrigger asChild>{children}</SheetTrigger>
				<SheetContent
					ref={ref}
					side={'left'}
					className='max-w-[100vw] w-96 px-2'>
					<SheetTitle className='flex flex-row items-center gap-2'>
						{' '}
						<Soup className='w-6 h-6 text-fuchsia-500' /> Your Dishes
					</SheetTitle>
					<SheetDescription className='text-sm leading-tight pb-6'>
						These are your prepared dishes. You can create dishes by selecting
						items from your logged food list or add them from searched food
						items. You can then log all items from a dish instead of adding food
						items individually.
					</SheetDescription>
					{fetchingDishes ? (
						<ImSpinner2 className='animate-spin w-8 h-8 opacity-25' />
					) : (
						<>
							<ScrollArea className='w-full pr-3'>
								<div className='flex flex-col gap-6 max-h-[70vh]'>
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
							</ScrollArea>
						</>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
