'use client';

import { getFavouriteFoods } from '@/actions/food-actions';
import { GetFoodItem } from '@/types';
import { useEffect, useState } from 'react';
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

export default function FoodFavouriteListSheet() {
	const [favs, setFavs] = useState<GetFoodItem[]>();

	const getFavs = async () => {
		const res = await getFavouriteFoods();

		if (res.success) {
			setFavs(res.data as GetFoodItem[]);
		}
	};

	useEffect(() => {
		getFavs();
	}, []);

	return (
		<>
			{favs && favs.length > 0 ? (
				<Sheet>
					<SheetTrigger asChild>
						<div className='w-11 h-11 rounded-full p-2 bg-teal-600 flex flex-col items-center justify-center mt-1'>
							<BsBookmarkStarFill className='w-6 h-6 animate-pulse' />
						</div>
					</SheetTrigger>

					<SheetContent
						side={'left'}
						className='max-w-[100vw] w-full px-2'>
						<SheetTitle className='flex flex-row items-center gap-2'>
							<BsBookmarkStarFill className='text-teal-600 w-6 h-6' /> Your
							Favourite Foods
						</SheetTitle>
						<SheetDescription></SheetDescription>
						<ScrollArea className='w-full pt-4 pr-3'>
							<div className='max-h-[75vh] flex flex-col items-center gap-4'>
								{favs.map((item) => (
									<FoodItemCard
										item={item}
										key={item.id}
									/>
								))}
							</div>
						</ScrollArea>
					</SheetContent>
				</Sheet>
			) : null}
		</>
	);
}
