'use client';

import { GetFoodEntry } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Badge } from 'lucide-react';
import FoodCategoryIconMapper from './food-category-icon-mapper';

export default function FoodEntryCard({ item }: { item: GetFoodEntry }) {
	return (
		<Card>
			<CardHeader>
				<div className='flex flex-row items-center gap-2'>
					<FoodCategoryIconMapper type={item.category} />
					<div>{item.name}</div>
				</div>

				<div className='flex flex-row items-center gap-2'>
					<div>{item.numServings}</div>
					<div>{item.numServings === 1 ? 'Serving' : 'Servings'}</div>
				</div>
			</CardHeader>
			<CardDescription className='px-6'>{item.description}</CardDescription>
			<CardContent>
				<Badge>{item.carbGrams} g</Badge>
				<Badge>{item.proteinGrams} g</Badge>
				<Badge>{item.fatGrams} g</Badge>
				<Badge>{item.calories}</Badge>
				<Badge></Badge>
			</CardContent>
		</Card>
	);
}
