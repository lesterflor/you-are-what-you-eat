'use client';

import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { useEffect, useState } from 'react';
import { GetFoodItem } from '@/types';
import { getFoodItems } from '@/actions/food-actions';
import FoodItemCard from './food-item-card';
import { ScrollArea } from '../ui/scroll-area';

export default function FoodListSheet() {
	const [foods, setFoods] = useState<GetFoodItem[]>([]);

	const getFoods = async () => {
		const res = await getFoodItems();

		if (res.success && res.data && res.data?.length > 0) {
			setFoods(res.data as GetFoodItem[]);
		}
	};

	useEffect(() => {
		getFoods();
	}, []);

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>
					<Search className='w-4 h-4' /> Browse
				</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetTitle>Food Index</SheetTitle>
				<ScrollArea className='h-[90vh] w-full pr-5'>
					<div className='flex flex-col gap-4 pb-5 w-[95%]'>
						{foods && foods.length > 0 ? (
							foods.map((item) => (
								<FoodItemCard
									item={item as GetFoodItem}
									key={item.id}
								/>
							))
						) : (
							<div>There are currently no entered food items.</div>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
