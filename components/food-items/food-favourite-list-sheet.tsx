'use client';

import { getFavouriteFoods } from '@/actions/food-actions';
import { GetFoodItem } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { BsBookmarkStarFill } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';
import { useInView } from 'react-intersection-observer';
import { ScrollArea } from '../ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import FoodItemCard from './food-item-card';

export default function FoodFavouriteListSheet({
	children,
	showBalloon = false
}: {
	children: React.ReactNode;
	showBalloon?: boolean;
}) {
	const [favs, setFavs] = useState<GetFoodItem[]>();
	const [isFetching, setIsFetching] = useState(false);
	const [ref, inView] = useInView();

	const fetchFavs = useCallback(async () => {
		setIsFetching(true);
		const res = await getFavouriteFoods();

		if (res.success) {
			setFavs(res.data as GetFoodItem[]);
		}

		setIsFetching(false);
	}, [favs]);

	// useEffect(() => {
	// 	if (inView) {
	// 		fetchFavs();
	// 	}
	// }, [inView]);

	useEffect(() => {
		fetchFavs();
	}, []);

	return (
		<>
			<Sheet>
				<SheetTrigger asChild>
					<div className='relative'>
						{children}
						{showBalloon && favs && favs.length > 0 && (
							<div className='absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center'>
								{favs?.length}
							</div>
						)}
					</div>
				</SheetTrigger>

				<SheetContent
					ref={ref}
					side={'top'}
					className='max-w-[100vw] w-full  px-2'>
					<SheetTitle className='flex flex-row items-center gap-2'>
						<BsBookmarkStarFill className='text-teal-600 w-6 h-6' /> Your
						Favourite Foods
					</SheetTitle>
					<SheetDescription></SheetDescription>

					<ScrollArea className='w-full pt-4 pr-3 h-[70vh]'>
						{isFetching ? (
							<ImSpinner2 className='animate-spin w-6 h-6 opacity-20' />
						) : (
							favs &&
							favs.length > 0 && (
								<div className='flex flex-col items-center gap-4'>
									{favs.map((item) => (
										<FoodItemCard
											item={item}
											key={item.id}
										/>
									))}
								</div>
							)
						)}
					</ScrollArea>
				</SheetContent>
			</Sheet>
		</>
	);
}
