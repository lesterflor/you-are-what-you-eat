'use client';

import {
	selectPreparedDishData,
	selectPreparedDishStatus
} from '@/lib/features/dish/preparedDishSlice';
import { useAppSelector } from '@/lib/hooks';
import { getAllDishesOptions } from '@/lib/queries/dishQueries';
import { setStorageItem } from '@/lib/utils';
import { GetPreparedDish } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Soup } from 'lucide-react';
import { useEffect, useState } from 'react';
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
	const [sheetOpen, setSheetOpen] = useState(false);

	const dishData = useAppSelector(selectPreparedDishData);
	const dishStatus = useAppSelector(selectPreparedDishStatus);

	const {
		data: dishes,
		isFetching,
		isFetched
	} = useQuery(getAllDishesOptions());

	if (isFetched) {
		setStorageItem('preparedDishes', dishes);
	}

	useEffect(() => {
		if (dishStatus === 'logged') {
			setSheetOpen(false);
		}
	}, [dishData, dishStatus]);

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
						{isFetching ? (
							<ImSpinner2 className='animate-spin w-8 h-8 opacity-25' />
						) : (
							<div className='flex flex-col gap-6'>
								{dishes && dishes.length > 0 ? (
									dishes.map((item: GetPreparedDish) => (
										<DishCard
											key={item.id}
											dish={item as GetPreparedDish}
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
