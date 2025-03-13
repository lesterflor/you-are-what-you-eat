import React from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader
} from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function FoodItemCardSkeleton() {
	return (
		<Card>
			<CardHeader className='pb-4'>
				<Skeleton className='w-40 h-12' />
			</CardHeader>
			<CardDescription className='px-6 pb-4 flex flex-col gap-2'>
				<Skeleton className='w-full h-2' />
				<Skeleton className='w-full h-2' />
				<Skeleton className='w-full h-2' />
			</CardDescription>
			<CardContent className='flex flex-row flex-wrap gap-6'>
				{Array.from({ length: 5 }).map((_v, indx) => (
					<Skeleton
						key={indx}
						className='w-16 h-8'
					/>
				))}
			</CardContent>

			<CardFooter className='flex flex-row flex-wrap items-center gap-4 justify-end'>
				<Skeleton className='w-16 h-8' />
				<Skeleton className='w-40 h-12' />
				<Skeleton className='w-24 h-10' />
			</CardFooter>
		</Card>
	);
}
