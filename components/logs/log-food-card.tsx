'use client';

import { GetFoodEntry } from '@/types';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader
} from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

export default function LogFoodCard({ item }: { item: GetFoodEntry }) {
	return (
		<Card>
			<CardHeader className='pb-2 flex flex-row items-center gap-2'>
				<div className='capitalize font-semibold'>
					<div className='text-2xl'>{item.name}</div>
					<span className='text-muted-foreground flex flex-row items-center'>
						{item.numServings} {item.numServings === 1 ? 'serving' : 'servings'}
					</span>
				</div>
			</CardHeader>
			<CardDescription className='px-6 pb-4'>
				{item.description}
			</CardDescription>
			<CardContent>
				<div className='flex flex-row flex-wrap gap-2'>
					<Badge variant='secondary'>
						Carbs: {item.carbGrams * item.numServings}
					</Badge>
					<Badge variant='secondary'>
						Protein: {item.proteinGrams * item.numServings}
					</Badge>
					<Badge variant='secondary'>
						Carbs: {item.fatGrams * item.numServings}
					</Badge>
				</div>
			</CardContent>
			<CardFooter className='flex flex-row items-center justify-between w-full'>
				<Badge
					variant='outline'
					className='flex felx-row items-center gap-2 p-2'>
					<Clock className='w-4 h-4' />
					{format(item.eatenAt, 'hh:mm a')}
				</Badge>
				<Badge className='text-md'>
					Calories: {item.calories * item.numServings}
				</Badge>
			</CardFooter>
		</Card>
	);
}
