'use client';

import { getFavouriteQueryOptions } from '@/lib/queries/favouriteQueries';
import { GetFoodItem } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { BsBookmarkStarFill } from 'react-icons/bs';
import { ScrollArea } from '../ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import FoodItemCard from './food-item-card';

const FoodFavouriteListSheet = memo(function FoodFavouriteListSheet({
	children,
	showBalloon = false
}: {
	children: React.ReactNode;
	showBalloon?: boolean;
}) {
	const { data: favs } = useQuery(getFavouriteQueryOptions());

	return (
		<>
			<Sheet>
				<SheetTrigger asChild>
					<div className='relative'>
						{children}
						{showBalloon && favs && favs.length > 0 && (
							<div className='transition-opacity fade-in animate-in duration-1000 absolute w-auto h-4 rounded-full text-white bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center'>
								{favs?.length}
							</div>
						)}
					</div>
				</SheetTrigger>

				<SheetContent
					side={'top'}
					className='max-w-[100vw] w-full  px-2'>
					<SheetTitle className='flex flex-row items-center gap-2 w-64'>
						<BsBookmarkStarFill className='text-teal-600 w-6 h-6' /> Your
						Favourite Foods
					</SheetTitle>
					<SheetDescription></SheetDescription>

					<ScrollArea className='w-full pt-4 pr-3 h-[70vh]'>
						{favs && favs.length > 0 && (
							<div className='flex flex-col items-center gap-4'>
								{favs.map((item: GetFoodItem) => (
									<FoodItemCard
										item={item}
										key={item.id}
									/>
								))}
							</div>
						)}
					</ScrollArea>
				</SheetContent>
			</Sheet>
		</>
	);
});

export default FoodFavouriteListSheet;
