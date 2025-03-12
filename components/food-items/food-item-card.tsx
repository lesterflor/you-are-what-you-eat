'use client';

import { FoodEntry, GetFoodItem } from '@/types';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader
} from '../ui/card';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import { Badge } from '../ui/badge';
import { useSession } from 'next-auth/react';
import { Button } from '../ui/button';
import NumberIncrementor from '../number-incrementor';
import { useState } from 'react';
import { createDailyLog, updateLog } from '@/actions/log-actions';
import { toast } from 'sonner';
import { FilePlus } from 'lucide-react';

export default function FoodItemCard({ item }: { item: GetFoodItem }) {
	const { data: session } = useSession();

	const [logFoodItem, setLogFoodItem] = useState<FoodEntry>({
		id: item.id,
		name: item.name,
		category: item.category,
		description: item.description ?? '',
		numServings: 1,
		image: item.image || '',
		carbGrams: item.carbGrams,
		fatGrams: item.fatGrams,
		proteinGrams: item.proteinGrams,
		calories: item.calories,
		eatenAt: new Date()
	});

	const sendFoodItems = async () => {
		const getLatestLog = await createDailyLog();

		const currentFoodItems = getLatestLog?.data?.foodItems || [];

		const cleanArr = currentFoodItems.map((item) => ({
			...item,
			description: item.description || '',
			image: item.image || ''
		}));

		const foodItems = [...cleanArr];
		foodItems.push(logFoodItem);
		const res = await updateLog(foodItems);

		if (res.success) {
			toast('Added to your daily log!');
		} else {
			toast.error('Oops, Something went wrong with adding the item.');
		}
	};

	return (
		<Card>
			<CardHeader className='text-2xl font-semibold capitalize pb-2 flex flex-row items-end justify-between gap-2'>
				<div className='flex flex-row items-center gap-2'>
					<FoodCategoryIconMapper type={item.category} />
					{item.name}
				</div>
			</CardHeader>
			<CardDescription className='px-6 pb-4'>
				{item.description}
			</CardDescription>
			<CardContent className='flex flex-row flex-wrap gap-6'>
				<div className='flex flex-row items-center gap-2'>
					<Badge variant='secondary'>Protein: {item.proteinGrams}g</Badge>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<Badge variant='secondary'>Carbs: {item.carbGrams}g</Badge>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<Badge variant='secondary'>Fat: {item.fatGrams}g</Badge>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<Badge variant='secondary'>Serving: {item.servingSize}</Badge>
				</div>

				<div className='flex flex-row items-center gap-2'>
					<Badge>Calories {item.calories}</Badge>
				</div>
			</CardContent>

			<CardFooter className='flex flex-row items-center justify-end'>
				{session && (
					<div className='flex flex-row items-end justify-center gap-2 flex-wrap'>
						<div className='flex flex-col items-center'>
							<span className='text-sm'>Servings</span>
							<NumberIncrementor
								onChange={(val) => {
									const entry: FoodEntry = {
										id: item.id,
										name: item.name,
										category: item.category,
										description: item.description ?? '',
										numServings: val,
										image: (item.image as string) ?? '',
										carbGrams: item.carbGrams,
										fatGrams: item.fatGrams,
										proteinGrams: item.proteinGrams,
										calories: item.calories,
										eatenAt: new Date()
									};

									setLogFoodItem(entry);
								}}
								minValue={1}
								value={1}
							/>
						</div>

						<Button
							onClick={(e) => {
								e.preventDefault();
								console.log(logFoodItem);
								sendFoodItems();
							}}>
							<FilePlus className='w-4 h-4' />
							Add to log
						</Button>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
