'use client';

import { GetFoodEntry } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { formatUnit } from '@/lib/utils';

export default function LogFoodCard({ item }: { item: GetFoodEntry }) {
	return (
		<Card>
			<CardHeader className='pb-2 flex flex-row items-center justify-between gap-2 pt-2'>
				<div className='capitalize font-semibold '>
					<div className='text-2xl portrait:text-lg'>{item.name}</div>
					<span className='text-muted-foreground flex flex-row items-center'>
						{item.numServings} {item.numServings === 1 ? 'serving' : 'servings'}
					</span>
				</div>
				<Badge
					variant='outline'
					className='flex flex-row items-center gap-2 p-2 whitespace-nowrap'>
					<Clock className='w-4 h-4' />
					{format(item.eatenAt, 'hh:mm a')}
				</Badge>
			</CardHeader>
			<CardDescription className='px-6 pb-4'>
				{item.description}
			</CardDescription>
			<CardContent>
				<div className='flex flex-row flex-wrap gap-1'>
					<Badge variant='secondary'>
						Carbs: {formatUnit(item.carbGrams * item.numServings)} g
					</Badge>
					<Badge variant='secondary'>
						Protein: {formatUnit(item.proteinGrams * item.numServings)} g
					</Badge>
					<Badge variant='secondary'>
						Carbs: {formatUnit(item.fatGrams * item.numServings)} g
					</Badge>
					<Badge>
						Calories: {formatUnit(item.calories * item.numServings)}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
