'use client';

import { GetFoodItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import { Badge } from '../ui/badge';

export default function FoodItemCard({ item }: { item: GetFoodItem }) {
	return (
		<Card>
			<CardHeader className='text-xl font-semibold capitalize pb-2 flex flex-row items-center gap-2'>
				<FoodCategoryIconMapper type={item.category} />
				{item.name}
			</CardHeader>
			<CardDescription className='p-6'>{item.description}</CardDescription>
			<CardContent className='flex flex-row flex-wrap gap-8'>
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
		</Card>
	);
}
